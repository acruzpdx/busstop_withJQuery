var app = (function() {

    // Public Methods
    function init() {
        // Wire up the global objects
        controller.setView(view);
        view.setController(controller);
    }
    // Expose Public Methods
    return {
        init:init
    }
})();

window.addEventListener("load",app.init);
