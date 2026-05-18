window.onload = function () {

    let rangePret = document.getElementById("inp-pret");

    rangePret.oninput = function () {
        document.getElementById("infoPret").innerHTML = this.value;
    };

    document.getElementById("btn-filtrare").onclick = function () {

        let inpNume = document.getElementById("inp-nume").value.toLowerCase().trim();
        let textareaNume = document.getElementById("inp-nume");
        let inpDescriere = document.getElementById("inp-descriere").value.toLowerCase().trim();
        if (inpNume && !/^[a-zăâîșțA-ZĂÂÎȘȚ\s-]+$/.test(inpNume)) {
            alert("Numele produsului poate conține doar litere, spații și cratimă.");
            return;
        }

        if (inpDescriere && !/^[a-zăâîșțA-ZĂÂÎȘȚ\s-]+$/.test(inpDescriere)) {
            alert("Cuvântul din descriere poate conține doar litere, spații și cratimă.");
            return;
        }
        let inpPret = parseFloat(document.getElementById("inp-pret").value);
        let inpVegan =
            document.querySelector(
                "input[name='grVegan']:checked"
            ).value;
        let inpNoutati = document.getElementById("inp-noutati").checked;
        let inpCategorie = document.getElementById("inp-categorie").value;
        let inpTipTen = document.getElementById("inp-tip-ten").value.toLowerCase().trim();
        let inpIngrediente = Array.from(
            document.getElementById("inp-ingrediente").selectedOptions
        ).map(opt => opt.value.toLowerCase());

        let produse = document.getElementsByClassName("produs");

        for (let prod of produse) {

            let nume = prod.dataset.nume;
            let descriere = prod.dataset.descriere;
            let pret = parseFloat(prod.dataset.pret);
            let categorie = prod.dataset.categorie;
            let tipTen = prod.dataset.tipTen;
            let vegan = prod.dataset.vegan === "true";
            let dataProdus = new Date(prod.dataset.data);
            let dataNou = new Date("2026-03-01");
            let ingrediente = prod.dataset.ingrediente;

            let conditii = true;

            if (inpNume && !/^[a-zăâîșțA-ZĂÂÎȘȚ\s-]+$/.test(inpNume)) {

                textareaNume.classList.add("is-invalid");

                return;
            }
            else {

                textareaNume.classList.remove("is-invalid");

            }
            if (!nume.startsWith(inpNume)) {
                conditii = false;
            }

            if (!descriere.includes(inpDescriere)) {
                conditii = false;
            }

            if (pret < inpPret) {
                conditii = false;
            }

            if (inpCategorie !== "toate" && categorie !== inpCategorie) {
                conditii = false;
            }

            if (inpVegan == "vegan" && !vegan) {
                conditii = false;
            }

            if (inpVegan == "nonvegan" && vegan) {
                conditii = false;
            }

            if (inpNoutati && dataProdus < dataNou) {
                conditii = false;
            }
            if (inpTipTen && tipTen !== inpTipTen) {
                conditii = false;
            }
            prod.style.display = conditii ? "" : "none";
            for (let ingr of inpIngrediente) {
                if (!ingrediente.includes(ingr)) {
                    conditii = false;
                }
            }
        }
    };

    document.getElementById("sortCresc").onclick =
        function () {
            sorteazaProduse(1);
        };

    document.getElementById("sortDescresc").onclick =
        function () {
            sorteazaProduse(-1);
        };

    function sorteazaProduse(semn) {

        let produse =
            Array.from(
                document.getElementsByClassName("produs")
            );

        produse.sort(function (a, b) {

            let numeA =
                a.dataset.nume;

            let numeB =
                b.dataset.nume;

            if (numeA < numeB)
                return -1 * semn;

            if (numeA > numeB)
                return 1 * semn;

            let pretA =
                parseFloat(a.dataset.pret);

            let pretB =
                parseFloat(b.dataset.pret);

            let volA =
                parseFloat(
                    a.querySelector(".volum").innerText
                );

            let volB =
                parseFloat(
                    b.querySelector(".volum").innerText
                );

            let raportA = volA / pretA;
            let raportB = volB / pretB;

            return (raportA - raportB) * semn;

        });

        for (let prod of produse) {
            prod.parentNode.appendChild(prod);
        }
    }
    document.getElementById("resetare").onclick = function () {

        let raspuns = confirm("Sigur vrei să resetezi filtrele?");

        if (!raspuns)
            return;

        document.getElementById("inp-nume").value = "";
        document.getElementById("inp-descriere").value = "";
        document.getElementById("inp-pret").value = 0;
        document.getElementById("infoPret").innerHTML = 0;
        document.querySelector(
            "input[name='grVegan'][value='toate']"
        ).checked = true;
        document.getElementById("inp-noutati").checked = false;
        document.getElementById("inp-categorie").value = "toate";

        let produse = document.getElementsByClassName("produs");
        let vProduse = Array.from(produse);

        vProduse.sort(function (a, b) {
            return Number(a.dataset.index) - Number(b.dataset.index);
        });

        for (let prod of vProduse) {
            prod.parentNode.appendChild(prod);
            prod.style.display = "";
        }
        for (let opt of document.getElementById("inp-ingrediente").options) {
            opt.selected = false;
        }
    };
    document.getElementById("calculare").onclick =
        function () {

            let produse =
                document.getElementsByClassName("produs");

            let suma = 0;

            for (let prod of produse) {

                if (prod.style.display != "none") {

                    suma += parseFloat(
                        prod.dataset.pret
                    );

                }

            }

            let divInfo =
                document.createElement("div");

            divInfo.innerHTML =
                "Suma prețurilor: " +
                suma.toFixed(2) +
                " lei";

            divInfo.style.position = "fixed";
            divInfo.style.bottom = "20px";
            divInfo.style.right = "20px";
            divInfo.style.background = "#e88aa4";
            divInfo.style.color = "white";
            divInfo.style.padding = "15px";
            divInfo.style.borderRadius = "10px";
            divInfo.style.zIndex = "9999";

            document.body.appendChild(divInfo);

            setTimeout(function () {

                divInfo.remove();

            }, 2000);

        };
};