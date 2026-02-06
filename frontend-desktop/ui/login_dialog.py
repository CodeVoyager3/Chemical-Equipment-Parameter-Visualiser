from PyQt5.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout, QLabel, 
    QLineEdit, QPushButton, QMessageBox, QFrame
)
from PyQt5.QtCore import Qt
from PyQt5.QtGui import QFont
from theme import Theme


class LoginDialog(QDialog):
    """Login dialog for authentication before accessing the dashboard."""
    
    def __init__(self, api_client, parent=None):
        super().__init__(parent)
        self.api_client = api_client
        self.authenticated = False
        
        self.setWindowTitle("Login - Chemical Visualizer")
        self.setFixedSize(400, 350)
        self.setModal(True)
        self.setup_ui()
        
    def setup_ui(self):
        self.setStyleSheet(f"""
            QDialog {{
                background-color: {Theme.BACKGROUND};
            }}
            QLabel {{
                color: {Theme.FOREGROUND};
                background: transparent;
            }}
            QLineEdit {{
                background-color: {Theme.CARD};
                color: {Theme.FOREGROUND};
                border: 1px solid {Theme.BORDER};
                border-radius: 6px;
                padding: 10px;
                font-size: 14px;
            }}
            QLineEdit:focus {{
                border-color: {Theme.PRIMARY};
            }}
        """)
        
        layout = QVBoxLayout(self)
        layout.setContentsMargins(40, 40, 40, 40)
        layout.setSpacing(20)
        
        # Header
        header_frame = QFrame()
        header_layout = QVBoxLayout(header_frame)
        header_layout.setContentsMargins(0, 0, 0, 0)
        
        # Icon/Title
        icon_label = QLabel("🔐")
        icon_label.setAlignment(Qt.AlignCenter)
        icon_label.setStyleSheet("font-size: 40px;")
        
        title_label = QLabel("Welcome Back")
        title_label.setAlignment(Qt.AlignCenter)
        title_label.setStyleSheet(f"""
            font-size: 24px;
            font-weight: bold;
            color: {Theme.FOREGROUND};
        """)
        
        subtitle_label = QLabel("Please enter your credentials to continue")
        subtitle_label.setAlignment(Qt.AlignCenter)
        subtitle_label.setStyleSheet(f"color: {Theme.BORDER}; font-size: 12px;")
        
        header_layout.addWidget(icon_label)
        header_layout.addWidget(title_label)
        header_layout.addWidget(subtitle_label)
        
        layout.addWidget(header_frame)
        
        # Username field
        username_label = QLabel("Username")
        username_label.setStyleSheet("font-weight: bold; font-size: 12px;")
        self.username_input = QLineEdit()
        self.username_input.setPlaceholderText("Enter your username")
        
        # Password field
        password_label = QLabel("Password")
        password_label.setStyleSheet("font-weight: bold; font-size: 12px;")
        self.password_input = QLineEdit()
        self.password_input.setPlaceholderText("Enter your password")
        self.password_input.setEchoMode(QLineEdit.Password)
        
        # Login button
        self.login_btn = QPushButton("Login")
        self.login_btn.setStyleSheet(f"""
            QPushButton {{
                background-color: {Theme.PRIMARY};
                color: #ffffff;
                border-radius: 6px;
                padding: 12px;
                font-weight: bold;
                font-size: 14px;
                border: none;
            }}
            QPushButton:hover {{
                background-color: #094b5c;
            }}
            QPushButton:pressed {{
                background-color: #052a35;
            }}
        """)
        self.login_btn.clicked.connect(self.attempt_login)
        
        # Connect Enter key to login
        self.password_input.returnPressed.connect(self.attempt_login)
        self.username_input.returnPressed.connect(self.focus_password)
        
        layout.addWidget(username_label)
        layout.addWidget(self.username_input)
        layout.addWidget(password_label)
        layout.addWidget(self.password_input)
        layout.addSpacing(10)
        layout.addWidget(self.login_btn)
        layout.addStretch()
        
    def focus_password(self):
        self.password_input.setFocus()
        
    def attempt_login(self):
        username = self.username_input.text().strip()
        password = self.password_input.text()
        
        if not username or not password:
            QMessageBox.warning(self, "Validation Error", "Please enter both username and password.")
            return
        
        # Test credentials by making a simple authenticated request
        self.login_btn.setText("Logging in...")
        self.login_btn.setEnabled(False)
        
        try:
            # Store credentials in API client for future requests
            self.api_client.set_credentials(username, password)
            
            # Test authentication with a simple request
            if self.api_client.test_auth():
                self.authenticated = True
                self.accept()
            else:
                QMessageBox.critical(self, "Login Failed", "Invalid username or password.")
                self.api_client.clear_credentials()
        except Exception as e:
            QMessageBox.critical(self, "Connection Error", f"Could not connect to server:\n{str(e)}")
            self.api_client.clear_credentials()
        finally:
            self.login_btn.setText("Login")
            self.login_btn.setEnabled(True)
    
    def get_credentials(self):
        """Return the entered credentials as a tuple."""
        return (self.username_input.text().strip(), self.password_input.text())
