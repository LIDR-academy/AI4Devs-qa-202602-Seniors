# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: positions.feature.spec.js >> Position Board Kanban Management >> Backend fails to update candidate stage
- Location: .features-gen/positions.feature.spec.js:25:7

# Error details

```
Test timeout of 30000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - button "Volver al Dashboard" [ref=e4] [cursor=pointer]
  - heading "Posiciones" [level=2] [ref=e5]
  - generic [ref=e6]:
    - textbox "Buscar por título" [ref=e8]
    - textbox [ref=e10]:
      - /placeholder: Buscar por fecha
    - combobox [ref=e12]:
      - option "Estado" [selected]
      - option "Abierto"
      - option "Contratado"
      - option "Cerrado"
      - option "Borrador"
    - combobox [ref=e14]:
      - option "Manager" [selected]
      - option "John Doe"
      - option "Jane Smith"
      - option "Alex Jones"
  - generic [ref=e15]:
    - generic [ref=e18]:
      - generic [ref=e19]: Senior Full-Stack Engineer
      - paragraph [ref=e20]:
        - strong [ref=e21]: "Manager:"
        - text: hr@lti.com
        - strong [ref=e22]: "Deadline:"
        - text: 31/12/2024
      - generic [ref=e23]: Open
      - generic [ref=e24]:
        - button "Ver proceso" [ref=e25] [cursor=pointer]
        - button "Editar" [ref=e26] [cursor=pointer]
    - generic [ref=e29]:
      - generic [ref=e30]: Data Scientist
      - paragraph [ref=e31]:
        - strong [ref=e32]: "Manager:"
        - text: hr@lti.com
        - strong [ref=e33]: "Deadline:"
        - text: 31/12/2024
      - generic [ref=e34]: Open
      - generic [ref=e35]:
        - button "Ver proceso" [ref=e36] [cursor=pointer]
        - button "Editar" [ref=e37] [cursor=pointer]
```