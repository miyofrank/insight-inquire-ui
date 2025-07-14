# 🎨 Insight Inquire UI

La interfaz de usuario (UI) de Insight Inquire es una aplicación web dinámica desarrollada con **React**, **TypeScript** y **Tailwind CSS**, que permite a los usuarios interactuar con encuestas, visualizar resultados y gestionar dashboards de manera intuitiva y responsiva.

---

## 🚀 Características Destacadas

- **📋 Navegación Limpia**: Utiliza **React Router** para rutas claras y definidas: vista de encuestas públicas, resultados, panel de control y autenticación.
- **🎨 Componentes Personalizados**: Basados en `shadcn/ui` y `lucide-react` para iconografía, botones, tarjetas, inputs, etc.
- **📐 Diseño Responsable**: Layout adaptativo con Tailwind Grid y Flex, garantizando una experiencia óptima en dispositivos móviles y desktops.
- **⚙️ Gestión de Estado Local**: Hooks de React (`useState`, `useEffect`) para manejar datos de encuestas, respuestas y loading states.
- **🔔 Feedback Inmediato**: Integración con **Sonner** para notificaciones toast al usuario.
- **🔑 Seguridad**: Dependencias de **JWT** en `localStorage` y control de rutas protegidas.
- **📊 Tablas y Gráficos**: Presentación de resultados individuales en tablas dinámicas y soporte para gráficas (recharts, etc.) en futuros desarrollos.

---

## 📁 Estructura del Proyecto

```
src/
├── components/         # Componentes genéricos (Button, Input, Card…)
├── pages/              # Vistas de la aplicación (PublicSurvey, SurveyResults, Dashboard…)
├── routes/             # Configuración de rutas con React Router
├── hooks/              # Custom hooks para autenticación y fetch de datos
├── lib/                # Utilidades, firebase config, cliente HTTP
├── context/            # Contextos de React (AuthContext…)
├── styles/             # Archivos Tailwind config y estilos globales
└── App.tsx             # Root de la aplicación
```

---

## 🔧 Instalación y Ejecución Local

1. Clonar el repositorio:
   ```bash
   ```

git clone [https://github.com/miyofrank/insight-inquire-ui.git](https://github.com/miyofrank/insight-inquire-ui.git) cd insight-inquire-ui

````

2. Instalar dependencias:
   ```bash
npm install
# o
yarn install
````

3. Configurar variables de entorno `.env.local`:
   ```env
   ```

REACT\_APP\_API\_URL=[https://backend-survey-phb2.onrender.com](https://backend-survey-phb2.onrender.com)

````

4. Iniciar servidor de desarrollo:
   ```bash
npm run dev
# o
yarn dev
````

La UI estará disponible en `http://localhost:3000`.

---

## 🔗 Rutas Principales

| Ruta             | Componente      | Descripción                                 |
| ---------------- | --------------- | ------------------------------------------- |
| `/`              | `HomePage`      | Página de bienvenida y acceso               |
| `/survey/:id`    | `PublicSurvey`  | Visualizar y responder una encuesta pública |
| `/results/:id`   | `SurveyResults` | Ver respuestas individuales y dashboard     |
| `/login`         | `LoginPage`     | Inicio de sesión de usuarios                |
| `/dashboard/:id` | `DashboardPage` | Análisis y gráficas personalizadas          |

---

## 🛠️ Tecnologías y Librerías

- **Framework:** React + TypeScript
- **Estilos:** Tailwind CSS
- **UI Components:** shadcn/ui, lucide-react
- **Routing:** React Router v6
- **Notificaciones:** sonner
- **HTTP Client:** Fetch API / Axios
- **Autenticación:** Firebase Auth (cliente)

---

## 🤝 Contribuciones

¡Contribuciones bienvenidas! Sigue estos pasos:

1. Fork del repositorio
2. Crear branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -m 'Agrega ...'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📬 Contacto

**Frank Cruz**\
📧 [miyofrank@gmail.com](mailto\:miyofrank@gmail.com)\
🔗 [GitHub](https://github.com/miyofrank)

