window.addEventListener("load", function () {

    console.log("tema.js incarcat");

    let switchTema = document.getElementById("switch-tema");
    let iconTema = document.getElementById("icon-tema");

    if (!switchTema) {
        console.log("Nu exista switch-tema");
        return;
    }

    let temaSalvata = localStorage.getItem("tema");

    if (temaSalvata === "dark") {
        document.body.classList.add("tema-dark");
        switchTema.checked = true;

        if (iconTema) {
            iconTema.classList.remove("fa-sun");
            iconTema.classList.add("fa-moon");
        }
    }

    switchTema.addEventListener("change", function () {

        document.body.classList.toggle("tema-dark", this.checked);

        localStorage.setItem(
            "tema",
            this.checked ? "dark" : "light"
        );

        if (iconTema) {
            iconTema.classList.toggle("fa-sun", !this.checked);
            iconTema.classList.toggle("fa-moon", this.checked);
        }

    });

});