import os
files = ['frontend/analytics.html', 'frontend/dispatch.html', 'frontend/expenses.html', 'frontend/maintenance.html', 'frontend/settings.html']
for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    if 'href=\"Dashboard.html\"' not in content:
        content = content.replace('<span class=\"nav-section-label\">Operations</span>', '<span class=\"nav-section-label\">Operations</span>\n      <a href=\"Dashboard.html\" class=\"nav-item\" id=\"nav-dashboard\"><svg><use href=\"#icon-dispatch\"/></svg> Dashboard</a>')
        
    if 'href=\"fleet.html\"' not in content:
        content = content.replace('</svg> Maintenance</a>', '</svg> Maintenance</a>\n      <a href=\"fleet.html\" class=\"nav-item\" id=\"nav-fleet\"><svg><use href=\"#icon-fleet\"/></svg> Fleet</a>')
        
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)

with open('frontend/Sign-in.html', 'r', encoding='utf-8') as file:
    signin = file.read()

if 'window.location.href' not in signin:
    signin = signin.replace('<form', '<form onsubmit=\"event.preventDefault(); window.location.href=\'Dashboard.html\';\"')
    with open('frontend/Sign-in.html', 'w', encoding='utf-8') as file:
        file.write(signin)
