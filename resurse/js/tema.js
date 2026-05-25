window.addEventListener("load", function () {
    const selectTema = document.getElementById("select-tema");
    const teme = ["light", "dark", "lavanda", "mint"];

    function aplicaTema(tema) {
        if (!teme.includes(tema)) tema = "light";

        document.body.classList.remove("tema-dark", "tema-lavanda", "tema-mint");

        if (tema !== "light") {
            document.body.classList.add("tema-" + tema);
        }

        localStorage.setItem("tema", tema);

        if (selectTema) {
            selectTema.value = tema;
        }
    }

    aplicaTema(localStorage.getItem("tema") || "light");

    selectTema?.addEventListener("change", function () {
        aplicaTema(this.value);
    });
});