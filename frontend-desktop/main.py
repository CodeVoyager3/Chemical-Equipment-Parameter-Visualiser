import sys
import os
from PyQt5.QtWidgets import QApplication
from ui.main_window import MainWindow

def main():
    # Helper to handle high DPI scaling (common on modern Windows)
    if hasattr(Qt, 'AA_EnableHighDpiScaling'):
        QApplication.setAttribute(Qt.AA_EnableHighDpiScaling, True)
    if hasattr(Qt, 'AA_UseHighDpiPixmaps'):
        QApplication.setAttribute(Qt.AA_UseHighDpiPixmaps, True)

    app = QApplication(sys.argv)
    
    # Load Stylesheet
    style_path = os.path.join(os.path.dirname(__file__), "ui", "styles.qss")
    if os.path.exists(style_path):
        with open(style_path, "r") as f:
            app.setStyleSheet(f.read())
    else:
        print(f"Warning: Stylesheet not found at {style_path}")

    window = MainWindow()
    window.show()
    
    sys.exit(app.exec_())

if __name__ == "__main__":
    # Needed for import resolution if running from inside the folder
    sys.path.append(os.path.dirname(__file__))
    from PyQt5.QtCore import Qt # Import here to ensure context is ready
    main()
