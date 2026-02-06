from PyQt5.QtWidgets import (
    QWidget, QPushButton, QLabel, QVBoxLayout, QFrame, 
    QGraphicsDropShadowEffect
)
from PyQt5.QtCore import Qt
from PyQt5.QtGui import QColor

class ModernButton(QPushButton):
    def __init__(self, text, parent=None, is_primary=False):
        super().__init__(text, parent)
        self.setCursor(Qt.PointingHandCursor)
        if is_primary:
            self.setProperty("class", "PrimaryBtn")
        else:
            self.setProperty("class", "SecondaryBtn")

class SidebarButton(QPushButton):
    def __init__(self, text, icon_text="", parent=None):
        if icon_text:
             super().__init__(f"  {icon_text}   {text}", parent)
        else:
             super().__init__(f"  {text}", parent)
        self.setCheckable(True)
        self.setAutoExclusive(True)
        self.setCursor(Qt.PointingHandCursor)
        self.setProperty("class", "SidebarBtn")

class Card(QFrame):
    def __init__(self, title, value=None, description=None, parent=None):
        super().__init__(parent)
        self.setProperty("class", "Card")
        
        layout = QVBoxLayout(self)
        layout.setContentsMargins(20, 20, 20, 20)
        layout.setSpacing(10)
        
        # Title
        self.title_lbl = QLabel(title)
        self.title_lbl.setProperty("class", "CardTitle")
        layout.addWidget(self.title_lbl)
        
        # Value (optional)
        if value:
            self.value_lbl = QLabel(value)
            self.value_lbl.setProperty("class", "CardValue")
            layout.addWidget(self.value_lbl)
            
        # Description (optional)
        if description:
            self.desc_lbl = QLabel(description)
            self.desc_lbl.setProperty("class", "CardDescription")
            self.desc_lbl.setWordWrap(True)
            layout.addWidget(self.desc_lbl)
            
        layout.addStretch()

        # Add Shadow for depth
        shadow = QGraphicsDropShadowEffect(self)
        shadow.setBlurRadius(20)
        shadow.setXOffset(0)
        shadow.setYOffset(4)
        shadow.setColor(QColor(0, 0, 0, 60))
        self.setGraphicsEffect(shadow)
