import tkinter as tk
from tkinter import ttk, scrolledtext
import subprocess
import threading
import queue
import time

class TranslationGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Plamo Translation")
        self.root.geometry("1200x600")
        
        # Queue for thread communication
        self.translation_queue = queue.Queue()
        
        # Timer for delayed translation
        self.translation_timer = None
        
        self.setup_ui()
        self.check_translation_queue()
        
    def setup_ui(self):
        # Main container
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Configure grid weights
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(0, weight=1)
        main_frame.columnconfigure(2, weight=1)
        main_frame.rowconfigure(1, weight=1)
        
        # Headers
        left_header = ttk.Label(main_frame, text="日本語", font=("Arial", 14, "bold"))
        left_header.grid(row=0, column=0, pady=(0, 5), sticky=tk.W)
        
        right_header = ttk.Label(main_frame, text="English", font=("Arial", 14, "bold"))
        right_header.grid(row=0, column=2, pady=(0, 5), sticky=tk.W)
        
        # Input text area (left)
        self.input_text = scrolledtext.ScrolledText(
            main_frame,
            wrap=tk.WORD,
            width=50,
            height=25,
            font=("Arial", 12)
        )
        self.input_text.grid(row=1, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        self.input_text.bind('<<Modified>>', self.on_input_change)
        
        # Separator
        separator = ttk.Separator(main_frame, orient='vertical')
        separator.grid(row=0, column=1, rowspan=2, sticky=(tk.N, tk.S), padx=10)
        
        # Output text area (right)
        self.output_text = scrolledtext.ScrolledText(
            main_frame,
            wrap=tk.WORD,
            width=50,
            height=25,
            font=("Arial", 12),
            state=tk.DISABLED,
            bg="#f5f5f5"
        )
        self.output_text.grid(row=1, column=2, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Status bar
        self.status_var = tk.StringVar(value="準備完了")
        status_bar = ttk.Label(main_frame, textvariable=self.status_var)
        status_bar.grid(row=2, column=0, columnspan=3, pady=(5, 0), sticky=tk.W)
        
    def on_input_change(self, event):
        # Cancel previous timer if exists
        if self.translation_timer:
            self.root.after_cancel(self.translation_timer)
        
        # Set new timer (wait 500ms after last keystroke)
        self.translation_timer = self.root.after(500, self.start_translation)
        
        # Reset modified flag
        self.input_text.edit_modified(False)
        
    def start_translation(self):
        text = self.input_text.get("1.0", tk.END).strip()
        if text:
            # Start translation in a separate thread
            thread = threading.Thread(target=self.translate_text, args=(text,))
            thread.daemon = True
            thread.start()
            self.status_var.set("翻訳中...")
        else:
            # Clear output if input is empty
            self.output_text.config(state=tk.NORMAL)
            self.output_text.delete("1.0", tk.END)
            self.output_text.config(state=tk.DISABLED)
            self.status_var.set("準備完了")
    
    def translate_text(self, text):
        try:
            # Prepare the command
            cmd = [
                "python", "-m", "mlx_lm", "generate",
                "--model", "mlx-community/plamo-2-translate",
                "--extra-eos-token", "<|plamo:op|>",
                "--prompt", text
            ]
            
            # Run the command
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                check=True
            )
            
            # Extract the translated text
            output = result.stdout.strip()
            # The output format includes the prompt and response
            # We need to extract just the translation part
            if "Response:" in output:
                translation = output.split("Response:")[-1].strip()
            else:
                # Fallback: remove the prompt from the beginning
                translation = output.replace(text, "", 1).strip()
                # Remove any leading separators
                translation = translation.lstrip("-=")
                translation = translation.strip()
            
            # Put translation in queue
            self.translation_queue.put(("success", translation))
            
        except subprocess.CalledProcessError as e:
            self.translation_queue.put(("error", f"翻訳エラー: {e.stderr}"))
        except Exception as e:
            self.translation_queue.put(("error", f"エラー: {str(e)}"))
    
    def check_translation_queue(self):
        try:
            while True:
                status, result = self.translation_queue.get_nowait()
                
                self.output_text.config(state=tk.NORMAL)
                self.output_text.delete("1.0", tk.END)
                
                if status == "success":
                    self.output_text.insert("1.0", result)
                    self.status_var.set("翻訳完了")
                else:
                    self.output_text.insert("1.0", result)
                    self.status_var.set("エラー")
                
                self.output_text.config(state=tk.DISABLED)
                
        except queue.Empty:
            pass
        
        # Schedule next check
        self.root.after(100, self.check_translation_queue)

def main():
    root = tk.Tk()
    app = TranslationGUI(root)
    root.mainloop()

if __name__ == "__main__":
    main()