const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 8080;

console.log("__dirname =", __dirname);
console.log("__filename =", __filename);
console.log("process.cwd() =", process.cwd());
console.log("__dirname === process.cwd() ?", __dirname === process.cwd());

const vect_foldere = ["temp", "logs", "backup", "fisiere_uploadate"];
for (let folder of vect_foldere) {
    let caleFolder = path.join(__dirname, folder);
    if (!fs.existsSync(caleFolder)) {
        fs.mkdirSync(caleFolder);
        console.log("A fost creat folderul:", caleFolder);
    }
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use((req, res, next) => {
    res.locals.ip = req.ip;
    next();
});

let obGlobal = {
    obErori: null
};

function initErori() {
    const continut = fs.readFileSync(path.join(__dirname, "erori.json"), "utf-8");
    obGlobal.obErori = JSON.parse(continut);

    for (let eroare of obGlobal.obErori.info_erori) {
        eroare.imagine = path.join(obGlobal.obErori.cale_baza, eroare.imagine);
    }

    obGlobal.obErori.eroare_default.imagine = path.join(
        obGlobal.obErori.cale_baza,
        obGlobal.obErori.eroare_default.imagine
    );
}

initErori();

function afisareEroare(res, identificator, titlu, text, imagine) {
    let eroare = obGlobal.obErori.eroare_default;

    if (identificator) {
        let eroareGasita = obGlobal.obErori.info_erori.find(
            err => err.identificator == identificator
        );

        if (eroareGasita) {
            eroare = eroareGasita;
        }
    }

    let titluFinal = titlu || eroare.titlu;
    let textFinal = text || eroare.text;
    let imagineFinal = imagine || eroare.imagine;
    let statusFinal = 200;

    if (eroare.status) {
        statusFinal = identificator || 500;
    }

    res.status(statusFinal).render("pagini/eroare", {
        titluPagina: "Eroare",
        titlu: titluFinal,
        text: textFinal,
        imagine: imagineFinal
    });
}

app.get("/favicon.ico", (req, res) => {
    res.sendFile(path.join(__dirname, "resurse", "ico", "favicon.ico"));
});

app.get(/.*\.ejs$/, (req, res) => {
    afisareEroare(res, 400);
});

app.get(/^\/resurse(\/[a-zA-Z0-9_-]+)+\/$/, (req, res) => {
    afisareEroare(res, 403);
});

app.use("/resurse", express.static(path.join(__dirname, "resurse")));

app.get(["/", "/index", "/home"], (req, res) => {
    res.render("pagini/index", { titluPagina: "Acasă" });
});

app.get(/.*/, (req, res) => {
    let pagina = req.path.replace(/^\//, "");

    res.render(`pagini/${pagina}`, function (err, rezultatRandare) {
        if (err) {
            if (err.message.startsWith("Failed to lookup view")) {
                afisareEroare(res, 404);
            } else {
                afisareEroare(res, null);
            }
            return;
        }
        res.send(rezultatRandare);
    });
});


app.listen(PORT, () => {
    console.log(`Serverul a pornit: http://localhost:${PORT}`);
});
