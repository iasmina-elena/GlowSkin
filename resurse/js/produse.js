window.onload = function () {

    let rangePret = document.getElementById("inp-pret");

    const K = 4;
    let paginaCurenta = 1;

    let produseFixate = new Set();

    rangePret.oninput = function () {
        document.getElementById("infoPret").innerHTML = this.value;
    };

    function normalizeaza(text) {
        return text
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/ș/g, "s")
            .replace(/ț/g, "t")
            .replace(/ă/g, "a")
            .replace(/â/g, "a")
            .replace(/î/g, "i");
    }

    function actualizeazaPaginare() {
        let produseVizibile = Array.from(document.getElementsByClassName("produs"))
            .filter(prod => prod.dataset.ascunsSesiune !== "true")
            .filter(prod => prod.dataset.treceFiltrarea !== "false");

        let nrPagini = Math.ceil(produseVizibile.length / K);
        let divPaginare = document.getElementById("paginare-produse");

        divPaginare.innerHTML = "";

        if (paginaCurenta > nrPagini) {
            paginaCurenta = 1;
        }

        produseVizibile.forEach((prod, index) => {
            if (index >= (paginaCurenta - 1) * K && index < paginaCurenta * K) {
                prod.style.display = "";
            } else {
                prod.style.display = "none";
            }
        });

        for (let i = 1; i <= nrPagini; i++) {
            let btn = document.createElement("button");
            btn.innerText = i;
            btn.className = "btn btn-sm btn-outline-primary mx-1";

            if (i === paginaCurenta) {
                btn.classList.add("active");
            }

            btn.onclick = function () {
                paginaCurenta = i;
                actualizeazaPaginare();
            };

            divPaginare.appendChild(btn);
        }

        let nrAfisate = document.getElementById("nr-produse-afisate");
        if (nrAfisate) {
            nrAfisate.textContent = produseVizibile.length;
        }

        let mesaj = document.getElementById("mesaj-fara-produse");
        if (mesaj) {
            mesaj.hidden = produseVizibile.length !== 0;
        }
    }

    function marcheazaCeleMaiIeftine() {
        let produse = Array.from(document.getElementsByClassName("produs"));
        let minPeCategorie = {};

        for (let prod of produse) {
            let categorie = prod.dataset.categorie;
            let pret = parseFloat(prod.dataset.pret);

            if (!minPeCategorie[categorie] || pret < minPeCategorie[categorie].pret) {
                minPeCategorie[categorie] = {
                    pret: pret,
                    produs: prod
                };
            }
        }

        for (let prod of produse) {
            let badge = prod.querySelector(".badge-cel-mai-ieftin");

            if (!badge) continue;

            if (minPeCategorie[prod.dataset.categorie].produs === prod) {
                badge.textContent = "Cel mai ieftin din categoria sa";
                badge.classList.add("badge-ieftin-activ");
            } else {
                badge.textContent = "";
                badge.classList.remove("badge-ieftin-activ");
            }
        }
    }

    function initializeazaButoaneProduse() {

        let produse = document.getElementsByClassName("produs");

        for (let prod of produse) {

            let id = prod.dataset.id;

            // PASTREAZA
            let btnPastreaza = prod.querySelector(".btn-pastreaza");

            btnPastreaza.onclick = function () {

                if (produseFixate.has(id)) {
                    produseFixate.delete(id);

                    prod.classList.remove("produs-fixat");
                    btnPastreaza.classList.remove("active");
                }
                else {
                    produseFixate.add(id);

                    prod.classList.add("produs-fixat");
                    btnPastreaza.classList.add("active");
                }
            };

            // ASCUNDE TEMPORAR
            let btnAscunde = prod.querySelector(".btn-ascunde");

            btnAscunde.onclick = function () {
                prod.style.display = "none";
            };

            // STERGE SESIUNE
            let btnSterge = prod.querySelector(".btn-sterge-sesiune");

            btnSterge.onclick = function () {

                sessionStorage.setItem(
                    "produs_sters_" + id,
                    "true"
                );

                prod.dataset.ascunsSesiune = "true";

                actualizeazaPaginare();
            };

            // reincarcare sesiune
            if (sessionStorage.getItem("produs_sters_" + id) === "true") {
                prod.dataset.ascunsSesiune = "true";
            }
        }
    }

    function initializeazaModal() {

        let modal = document.getElementById("modal-produs");
        let continut = document.getElementById("continut-modal-produs");
        let btnInchide = document.getElementById("inchide-modal");

        let produse = document.getElementsByClassName("produs");

        for (let prod of produse) {

            prod.addEventListener("click", function (e) {

                if (e.target.closest("button")) {
                    return;
                }

                continut.innerHTML = `
                <h2>${prod.dataset.nume}</h2>

                <img
                    src="${prod.dataset.imagine}"
                    style="max-width:250px; width:100%; border-radius:10px;"
                >

                <p><b>Preț:</b> ${prod.dataset.pret} lei</p>

                <p><b>Categorie:</b> ${prod.dataset.categorie}</p>

                <p>${prod.dataset.descriere}</p>
            `;

                modal.style.display = "flex";
            });
        }

        btnInchide.onclick = function () {
            modal.style.display = "none";
        };

        modal.onclick = function (e) {
            if (e.target === modal) {
                modal.style.display = "none";
            }
        };
    }

    function aplicaFiltrare() {

        let inpNume = normalizeaza(
            document.getElementById("inp-nume").value.trim()
        );
        let textareaNume = document.getElementById("inp-nume");
        let inpDescriere = normalizeaza(
            document.getElementById("inp-descriere").value.trim()
        );
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

            let nume = normalizeaza(prod.dataset.nume);
            let descriere = normalizeaza(prod.dataset.descriere);
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

            for (let ingr of inpIngrediente) {
                if (!ingrediente.includes(ingr)) {
                    conditii = false;
                }
            }
            if (produseFixate.has(prod.dataset.id)) {
                conditii = true;
            }
            prod.dataset.treceFiltrarea = conditii ? "true" : "false";
        }
        let produseVizibile = Array.from(document.getElementsByClassName("produs"))
            .filter(prod => prod.dataset.treceFiltrarea !== "false");

        document.getElementById("mesaj-fara-produse").hidden = produseVizibile.length !== 0;
        let nr = Array.from(document.getElementsByClassName("produs"))
            .filter(prod => prod.style.display !== "none").length;

        document.getElementById("nr-produse-afisate").textContent = nr;

        ["inp-nume", "inp-descriere", "inp-tip-ten", "inp-pret", "inp-noutati", "inp-categorie", "inp-ingrediente"].forEach(id => {
            let el = document.getElementById(id);
            el.addEventListener("input", aplicaFiltrare);
            el.addEventListener("change", aplicaFiltrare);
        });

        document.querySelectorAll("input[name='grVegan']").forEach(el => {
            el.addEventListener("change", aplicaFiltrare);
        });

        paginaCurenta = 1;
        actualizeazaPaginare();
    }
    document.getElementById("btn-filtrare").onclick = aplicaFiltrare;

    document.getElementById("sortCresc").onclick =
        function () {
            sorteazaProduse(1);
        };

    document.getElementById("sortDescresc").onclick =
        function () {
            sorteazaProduse(-1);
        };

    function valoareSortare(prod, cheie) {
        if (cheie === "nume") {
            return prod.dataset.nume;
        }

        if (cheie === "pret") {
            return parseFloat(prod.dataset.pret);
        }

        if (cheie === "categorie") {
            return prod.dataset.categorie;
        }

        if (cheie === "volum") {
            return parseFloat(prod.querySelector(".volum").innerText);
        }

        return "";
    }

    function comparaValori(a, b, semn) {
        if (typeof a === "number" && typeof b === "number") {
            return (a - b) * semn;
        }

        return a.localeCompare(b) * semn;
    }

    function sorteazaProduse(semn) {
        let cheie1 = document.getElementById("sort-cheie1").value;
        let cheie2 = document.getElementById("sort-cheie2").value;

        let produse = Array.from(document.getElementsByClassName("produs"));

        produse.sort(function (a, b) {
            let valA1 = valoareSortare(a, cheie1);
            let valB1 = valoareSortare(b, cheie1);

            let comparatie1 = comparaValori(valA1, valB1, semn);

            if (comparatie1 !== 0) {
                return comparatie1;
            }

            let valA2 = valoareSortare(a, cheie2);
            let valB2 = valoareSortare(b, cheie2);

            return comparaValori(valA2, valB2, semn);
        });

        for (let prod of produse) {
            prod.parentNode.appendChild(prod);
        }

        actualizeazaPaginare();
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
    for (let prod of document.getElementsByClassName("produs")) {
        prod.dataset.treceFiltrarea = "true";
    }

    initializeazaModal();
    initializeazaButoaneProduse();
    marcheazaCeleMaiIeftine();
    actualizeazaPaginare();
};