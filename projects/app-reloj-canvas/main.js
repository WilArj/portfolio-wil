const canvas = document.getElementById("clock-canvas");
const ctx = canvas.getContext("2d");

// Opciones del Reloj
let options = {
    sweepSmooth: true,
    showMilliseconds: true,
    showDigital: true,
    theme: 'dark'
};

// Configuración de Colores según el tema activo
const themeColors = {
    dark: {
        bg: "#141416",
        face: "#1a1a1e",
        border: "rgba(255, 255, 255, 0.08)",
        ticks: "#52525b",
        hourHand: "#fafafa",
        minuteHand: "#a1a1aa",
        secondHand: "#6366f1",
        accent: "#6366f1",
        text: "#fafafa",
        textMuted: "#71717a"
    },
    light: {
        bg: "#ffffff",
        face: "#f8fafc",
        border: "rgba(15, 23, 42, 0.08)",
        ticks: "#94a3b8",
        hourHand: "#0f172a",
        minuteHand: "#475569",
        secondHand: "#4f46e5",
        accent: "#4f46e5",
        text: "#0f172a",
        textMuted: "#64748b"
    },
    accent: {
        bg: "#0b132b",
        face: "#0f1c3f",
        border: "rgba(0, 245, 212, 0.2)",
        ticks: "#48cae4",
        hourHand: "#e0e1dd",
        minuteHand: "#00b4d8",
        secondHand: "#00f5d4",
        accent: "#00f5d4",
        text: "#00f5d4",
        textMuted: "#8d99ae"
    }
};

// Interactividad del Ratón (Efecto de brillo)
let mouse = { x: 0, y: 0, inside: false };
const rect = canvas.getBoundingClientRect();

canvas.addEventListener("mousemove", (e) => {
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    mouse.x = (e.clientX - rect.left) * scaleX;
    mouse.y = (e.clientY - rect.top) * scaleY;
    mouse.inside = true;
});

canvas.addEventListener("mouseleave", () => {
    mouse.inside = false;
});

// Dibujar una manecilla con estilo
function drawHand(angle, length, width, color, shadowBlur = 0, shadowColor = "") {
    ctx.save();
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 15); // Pequeña cola detrás del eje
    ctx.lineTo(0, -length);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    
    if (shadowBlur > 0) {
        ctx.shadowBlur = shadowBlur;
        ctx.shadowColor = shadowColor;
    }
    
    ctx.stroke();
    ctx.restore();
}

// Bucle de renderizado
function render() {
    const colors = themeColors[options.theme];
    const width = canvas.width;
    const height = canvas.height;
    const radius = width / 2 - 20;

    // Limpiar canvas
    ctx.clearRect(0, 0, width, height);

    // Guardar contexto para centrar en el origen (0,0)
    ctx.save();
    ctx.translate(width / 2, height / 2);

    // 1. Dibujar el fondo del reloj (Clock Face)
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.fillStyle = colors.face;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = colors.border;
    ctx.stroke();

    // 2. Efecto de brillo interactivo del ratón
    if (mouse.inside) {
        const localMouseX = mouse.x - width / 2;
        const localMouseY = mouse.y - height / 2;
        
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, radius - 2, 0, 2 * Math.PI);
        ctx.clip(); // Limitar el brillo al interior del reloj
        
        const gradient = ctx.createRadialGradient(
            localMouseX, localMouseY, 5,
            localMouseX, localMouseY, 150
        );
        gradient.addColorStop(0, colors.accent + "22"); // 12% opacidad
        gradient.addColorStop(1, "transparent");
        
        ctx.fillStyle = gradient;
        ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
        ctx.restore();
    }

    // 3. Dibujar marcas de las horas y minutos (Ticks)
    ctx.save();
    for (let i = 0; i < 60; i++) {
        const isHour = i % 5 === 0;
        ctx.beginPath();
        ctx.moveTo(0, -radius + 8);
        ctx.lineTo(0, -radius + (isHour ? 20 : 13));
        ctx.strokeStyle = isHour ? colors.text : colors.ticks;
        ctx.lineWidth = isHour ? 2.5 : 1;
        ctx.stroke();
        ctx.rotate(Math.PI / 30);
    }
    ctx.restore();

    // Obtener la hora actual
    const now = new Date();
    const ms = now.getMilliseconds();
    const sec = now.getSeconds() + (options.sweepSmooth ? ms / 1000 : 0);
    const min = now.getMinutes() + sec / 60;
    const hr = (now.getHours() % 12) + min / 60;

    // 4. Dibujar el reloj digital si está activado
    if (options.showDigital) {
        ctx.save();
        ctx.font = "300 24px 'Inter', sans-serif";
        ctx.fillStyle = colors.text;
        ctx.textAlign = "center";
        
        const hStr = String(now.getHours()).padStart(2, '0');
        const mStr = String(now.getMinutes()).padStart(2, '0');
        const sStr = String(now.getSeconds()).padStart(2, '0');
        let digitalText = `${hStr}:${mStr}:${sStr}`;
        
        if (options.showMilliseconds) {
            const msStr = String(Math.floor(ms / 10)).padStart(2, '0');
            digitalText += `.${msStr}`;
        }
        
        ctx.fillText(digitalText, 0, radius * 0.4);
        ctx.restore();
    }

    // 5. Dibujar las manecillas
    // Ángulos en radianes (restando Math.PI/2 para empezar en las 12 en punto)
    const hourAngle = (hr * Math.PI) / 6;
    const minAngle = (min * Math.PI) / 30;
    const secAngle = (sec * Math.PI) / 30;

    // Manecilla de las Horas
    drawHand(hourAngle, radius * 0.5, 6, colors.hourHand);

    // Manecilla de los Minutos
    drawHand(minAngle, radius * 0.75, 4, colors.minuteHand);

    // Manecilla de los Segundos (con sombra sutil)
    drawHand(
        secAngle, 
        radius * 0.85, 
        2, 
        colors.secondHand, 
        options.sweepSmooth ? 8 : 0, 
        colors.secondHand
    );

    // 6. Eje Central (Pin del reloj)
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, 2 * Math.PI);
    ctx.fillStyle = colors.secondHand;
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, 2 * Math.PI);
    ctx.fillStyle = colors.hourHand;
    ctx.fill();

    ctx.restore();

    requestAnimationFrame(render);
}

// Inicializar controles interactivos
function initControls() {
    // Modo de barrido
    const btnSmooth = document.getElementById("btn-sweep-smooth");
    const btnTick = document.getElementById("btn-sweep-tick");
    
    btnSmooth.addEventListener("click", () => {
        options.sweepSmooth = true;
        btnSmooth.classList.add("active");
        btnTick.classList.remove("active");
    });
    
    btnTick.addEventListener("click", () => {
        options.sweepSmooth = false;
        btnTick.classList.add("active");
        btnSmooth.classList.remove("active");
    });

    // Temas visuales
    const themeButtons = document.querySelectorAll(".btn-theme");
    themeButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            themeButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            const themeName = btn.getAttribute("data-theme");
            options.theme = themeName;
            
            // Actualizar clases del body para estilos CSS dinámicos
            document.body.className = ""; // Limpiar
            if (themeName !== 'dark') {
                document.body.classList.add(`theme-${themeName}`);
            }
        });
    });

    // Checkboxes
    const chkMs = document.getElementById("show-milliseconds");
    const chkDig = document.getElementById("show-digital");

    chkMs.addEventListener("change", (e) => {
        options.showMilliseconds = e.target.checked;
    });

    chkDig.addEventListener("change", (e) => {
        options.showDigital = e.target.checked;
        // Habilitar/desactivar sub-checkbox de milisegundos
        chkMs.disabled = !e.target.checked;
    });
}

// Iniciar app
document.addEventListener("DOMContentLoaded", () => {
    initControls();
    requestAnimationFrame(render);
});
