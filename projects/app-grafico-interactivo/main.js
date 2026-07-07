// Base de datos de ejemplo (respaldos)
const datasetsBackup = {
    productivity: [
        { label: "Lun", value: 4 },
        { label: "Mar", value: 6.5 },
        { label: "Mié", value: 5 },
        { label: "Jue", value: 8 },
        { label: "Vie", value: 7 },
        { label: "Sáb", value: 3.5 },
        { label: "Dom", value: 2 }
    ],
    visits: [
        { label: "Lun", value: 120 },
        { label: "Mar", value: 180 },
        { label: "Mié", value: 240 },
        { label: "Jue", value: 190 },
        { label: "Vie", value: 310 },
        { label: "Sáb", value: 140 },
        { label: "Dom", value: 95 }
    ],
    coffee: [
        { label: "Lun", value: 2 },
        { label: "Mar", value: 3 },
        { label: "Mié", value: 4 },
        { label: "Jue", value: 1 },
        { label: "Vie", value: 3 },
        { label: "Sáb", value: 2 },
        { label: "Dom", value: 0 }
    ]
};

// Datos activos modificables por el usuario
let activeData = JSON.parse(JSON.stringify(datasetsBackup.productivity));
let currentDatasetKey = "productivity";
let chartType = "line"; // 'line' o 'area'

const svg = document.getElementById("data-svg");
const tooltip = document.getElementById("chart-tooltip");
const datasetSelector = document.getElementById("dataset-selector");
const pointsList = document.getElementById("data-points-list");
const form = document.getElementById("add-data-form");
const chartTitle = document.getElementById("chart-title");

// Dimensiones y márgenes del gráfico
const width = 600;
const height = 320;
const padding = { top: 30, right: 30, bottom: 40, left: 50 };

// Renderizar el gráfico SVG completo
function renderChart() {
    // 1. Limpiar nodos SVG antiguos excepto los <defs>
    const defs = svg.querySelector("defs");
    svg.innerHTML = "";
    if (defs) svg.appendChild(defs);

    if (activeData.length === 0) {
        // Mostrar mensaje si no hay datos
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", width / 2);
        text.setAttribute("y", height / 2);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("fill", "var(--text-secondary)");
        text.textContent = "No hay datos disponibles. Añade un punto a continuación.";
        svg.appendChild(text);
        renderPointsManager();
        return;
    }

    // 2. Calcular límites de datos
    const values = activeData.map(d => d.value);
    const maxVal = Math.max(...values, 10); // Asegurar mínimo de escala y evitar divisiones por cero
    const minVal = 0; // Escalar desde cero para coherencia visual

    // Funciones auxiliares de escalado (Mapeo a coordenadas del SVG)
    const getX = (index) => {
        if (activeData.length <= 1) return padding.left + (width - padding.left - padding.right) / 2;
        return padding.left + (index / (activeData.length - 1)) * (width - padding.left - padding.right);
    };

    const getY = (val) => {
        return height - padding.bottom - ((val - minVal) / (maxVal - minVal)) * (height - padding.top - padding.bottom);
    };

    // 3. Dibujar Gridlines Horizontales y Eje Y
    const gridTicks = 4;
    for (let i = 0; i <= gridTicks; i++) {
        const val = minVal + (i / gridTicks) * (maxVal - minVal);
        const y = getY(val);

        // Línea de cuadrícula
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", padding.left);
        line.setAttribute("y1", y);
        line.setAttribute("x2", width - padding.right);
        line.setAttribute("y2", y);
        line.setAttribute("class", "grid-line");
        svg.appendChild(line);

        // Etiqueta del Eje Y
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", padding.left - 12);
        text.setAttribute("y", y + 4);
        text.setAttribute("text-anchor", "end");
        text.setAttribute("class", "axis-label");
        text.textContent = Number(val.toFixed(1));
        svg.appendChild(text);
    }

    // 4. Dibujar Etiquetas del Eje X
    activeData.forEach((d, i) => {
        const x = getX(i);
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", x);
        text.setAttribute("y", height - padding.bottom + 20);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("class", "axis-label");
        text.textContent = d.label;
        svg.appendChild(text);
    });

    // 5. Construir los Paths para la línea o el área
    let pathD = "";
    activeData.forEach((d, i) => {
        const cmd = i === 0 ? "M" : "L";
        pathD += `${cmd} ${getX(i)} ${getY(d.value)} `;
    });

    // Dibujar el área (si está activa)
    if (chartType === "area" && activeData.length > 1) {
        let areaD = pathD;
        // Cerrar el polígono hacia el fondo del eje
        areaD += `L ${getX(activeData.length - 1)} ${height - padding.bottom} `;
        areaD += `L ${getX(0)} ${height - padding.bottom} Z`;

        const areaPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        areaPath.setAttribute("d", areaD);
        areaPath.setAttribute("class", "chart-area");
        svg.appendChild(areaPath);
    }

    // Dibujar la línea principal
    const linePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    linePath.setAttribute("d", pathD);
    linePath.setAttribute("class", "chart-path");
    
    // Animación sutil de dibujo (stroke-dash)
    svg.appendChild(linePath);
    const totalLength = linePath.getTotalLength();
    linePath.style.strokeDasharray = totalLength;
    linePath.style.strokeDashoffset = totalLength;
    // Forzar reflujo
    linePath.getBoundingClientRect();
    linePath.style.transition = "stroke-dashoffset 0.8s ease-out, d 0.5s ease";
    linePath.style.strokeDashoffset = 0;

    // 6. Dibujar línea guía de hover (oculta al inicio)
    const hoverLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    hoverLine.setAttribute("y1", padding.top);
    hoverLine.setAttribute("y2", height - padding.bottom);
    hoverLine.setAttribute("class", "hover-line");
    hoverLine.style.display = "none";
    svg.appendChild(hoverLine);

    // 7. Dibujar los puntos del gráfico (Círculos interactivos)
    activeData.forEach((d, i) => {
        const x = getX(i);
        const y = getY(d.value);

        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", x);
        circle.setAttribute("cy", y);
        circle.setAttribute("r", 4.5);
        circle.setAttribute("class", "chart-point");
        
        // Eventos interactivos para Tooltip y Guías
        circle.addEventListener("mouseenter", (e) => {
            circle.classList.add("active");
            
            // Mostrar línea guía
            hoverLine.setAttribute("x1", x);
            hoverLine.setAttribute("x2", x);
            hoverLine.style.display = "block";

            // Mostrar tooltip flotante
            tooltip.innerHTML = `<strong>${d.label}</strong>: ${d.value}`;
            tooltip.style.opacity = 1;
            
            // Posicionar tooltip relativo al contenedor SVG
            const svgRect = svg.getBoundingClientRect();
            const percentX = (x / width) * 100;
            const percentY = (y / height) * 100;
            tooltip.style.left = `${percentX}%`;
            tooltip.style.top = `${percentY - 8}%`;
        });

        circle.addEventListener("mouseleave", () => {
            circle.classList.remove("active");
            hoverLine.style.display = "none";
            tooltip.style.opacity = 0;
        });

        svg.appendChild(circle);
    });

    renderPointsManager();
}

// Renderizar la lista lateral de puntos de datos activos
function renderPointsManager() {
    pointsList.innerHTML = "";
    activeData.forEach((d, i) => {
        const li = document.createElement("li");
        li.className = "point-item";
        li.innerHTML = `
            <div>
                <span class="point-label">${d.label}</span>: 
                <span class="point-value">${d.value}</span>
            </div>
            <button class="btn-delete-point" data-index="${i}" title="Eliminar">&times;</button>
        `;
        
        // Eliminar punto al hacer clic
        li.querySelector(".btn-delete-point").addEventListener("click", (e) => {
            const idx = parseInt(e.target.getAttribute("data-index"));
            activeData.splice(idx, 1);
            renderChart();
        });

        pointsList.appendChild(li);
    });
}

// Inicializar Controladores de la interfaz
function initControls() {
    // Selector de datasets por defecto
    datasetSelector.addEventListener("change", (e) => {
        currentDatasetKey = e.target.value;
        activeData = JSON.parse(JSON.stringify(datasetsBackup[currentDatasetKey]));
        
        // Actualizar título
        const titles = {
            productivity: "Métricas de Productividad",
            visits: "Visitas al Portfolio",
            coffee: "Consumo de Café"
        };
        chartTitle.textContent = titles[currentDatasetKey];
        
        renderChart();
    });

    // Alternar tipo de gráfico
    const btnLine = document.getElementById("btn-type-line");
    const btnArea = document.getElementById("btn-type-area");

    btnLine.addEventListener("click", () => {
        chartType = "line";
        btnLine.classList.add("active");
        btnArea.classList.remove("active");
        renderChart();
    });

    btnArea.addEventListener("click", () => {
        chartType = "area";
        btnArea.classList.add("active");
        btnLine.classList.remove("active");
        renderChart();
    });

    // Formulario para añadir puntos
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const labelInput = document.getElementById("input-label");
        const valueInput = document.getElementById("input-value");
        
        const newPoint = {
            label: labelInput.value.trim(),
            value: parseFloat(valueInput.value)
        };

        activeData.push(newPoint);
        renderChart();

        // Limpiar formulario y dar foco de nuevo
        labelInput.value = "";
        valueInput.value = "";
        labelInput.focus();
    });

    // Botón de restablecer datos
    document.getElementById("btn-reset-data").addEventListener("click", () => {
        activeData = JSON.parse(JSON.stringify(datasetsBackup[currentDatasetKey]));
        renderChart();
    });
}

// Iniciar app
document.addEventListener("DOMContentLoaded", () => {
    initControls();
    renderChart();
});
