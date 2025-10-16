/* js para el login */

const container = document.getElementById('container');
const overlayCon = document.getElementById('overlayCon');
const overlayBtn = document.getElementById('overlayBtn');

overlayBtn.addEventListener('click', () => {
    container.classList.toggle('right-panel-active');

    overlayBtn.classList.remove('btnScaled');
    window.requestAnimationFrame( () => {
        overlayBtn.classList.add('btnScaled');
    });
});



// Forzar recarga cuando el usuario vuelve con el botón "atrás"
window.addEventListener("pageshow", function (event) {
    if (event.persisted || (performance.navigation.type === 2)) {
        location.reload();
    }
});
