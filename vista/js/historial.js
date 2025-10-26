// --- Abrir / cerrar modal ---
const modal = document.getElementById("modalRegistro");
const btnNuevo = document.getElementById("btnNuevo");
const btnCerrar = document.getElementById("btnCerrar");

btnNuevo.onclick = () => (modal.style.display = "flex");
btnCerrar.onclick = () => (modal.style.display = "none");
window.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };

// --- Añadir nuevo registro a la tabla ---
document.getElementById("formHistorial").addEventListener("submit", function(e) {
  e.preventDefault();
  const nombre = document.getElementById("nombre").value;
  const dni = document.getElementById("dni").value;
  const edad = document.getElementById("edad").value;
  const diagnostico = document.getElementById("diagnostico").value;
  const fecha = document.getElementById("fecha").value;

  const tbody = document.getElementById("tablaBody");
  const fila = document.createElement("tr");
  fila.innerHTML = `
    <td><strong>${nombre}</strong><br><small>DNI ${dni}</small></td>
    <td>${edad}</td>
    <td><span class="pill">${diagnostico}</span></td>
    <td>${fecha.split('-').reverse().join('/')}</td>
    <td class="actions"><button class="btn view">Ver</button></td>
  `;
  tbody.appendChild(fila);
  modal.style.display = "none";
  this.reset();
});

// --- Exportar CSV ---
document.getElementById("btnCSV").addEventListener("click", () => {
  const rows = document.querySelectorAll("table tr");
  let csv = [];
  rows.forEach(row => {
    const cols = row.querySelectorAll("td, th");
    const data = Array.from(cols).map(col => `"${col.innerText}"`);
    csv.push(data.join(","));
  });
  const blob = new Blob([csv.join("\n")], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "historial_pacientes.csv";
  link.click();
});

// --- Exportar PDF con diseño incluido ---
document.getElementById("btnPDF").addEventListener("click", () => {
  const contenido = document.querySelector(".container").outerHTML;

  // Clona el CSS actual
  const estilos = Array.from(document.styleSheets)
    .map(sheet => {
      try {
        return Array.from(sheet.cssRules)
          .map(rule => rule.cssText)
          .join("\n");
      } catch (err) {
        return "";
      }
    })
    .join("\n");

  // Crea una nueva ventana con estilos integrados
  const ventanaPDF = window.open("", "", "width=900,height=700");
  ventanaPDF.document.write(`
    <html>
      <head>
        <title>Historial de Pacientes</title>
        <style>
          ${estilos}
          body {
            background-color: white !important;
            padding: 20px;
          }
          .toolbar, .modal { display: none !important; }
        </style>
      </head>
      <body>
        ${contenido}
      </body>
    </html>
  `);
  ventanaPDF.document.close();
  ventanaPDF.focus();
  ventanaPDF.print();
});
