const express = require("express");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const sass = require("sass");

const app = express();
const PORT = 8080;

console.log("__dirname =", __dirname);
console.log("__filename =", __filename);
console.log("process.cwd() =", process.cwd());
console.log("__dirname === process.cwd() ?", __dirname === process.cwd());

global.folderScss = path.join(__dirname, "resurse/scss");
global.folderCss = path.join(__dirname, "resurse/css");
global.folderBackup = path.join(__dirname, "backup");

["temp", "fisiere_uploadate", "backup"].forEach(folder => {
    const caleFolder = path.join(__dirname, folder);
    if (!fs.existsSync(caleFolder)) {
        fs.mkdirSync(caleFolder);
    }
});

function compileazaScss(caleScss, caleCss) {
    if (!path.isAbsolute(caleScss)) {
        caleScss = path.join(global.folderScss, caleScss);
    }

    if (!caleCss) {
        const numeFisier = path.basename(caleScss, ".scss") + ".css";
        caleCss = path.join(global.folderCss, numeFisier);
    } else if (!path.isAbsolute(caleCss)) {
        caleCss = path.join(global.folderCss, caleCss);
    }

    const caleBackupCss = path.join(
        global.folderBackup,
        "resurse/css",
        path.basename(caleCss)
    );

    fs.mkdirSync(path.dirname(caleBackupCss), { recursive: true });

    if (fs.existsSync(caleCss)) {
        try {
            fs.copyFileSync(caleCss, caleBackupCss);
        } catch (err) {
            console.error("Eroare la copierea backup-ului:", err.message);
        }
    }

    try {
        const rezultat = sass.compile(caleScss, { sourceMap: true });
        fs.writeFileSync(caleCss, rezultat.css);
        console.log(`Compilat: ${caleScss} -> ${caleCss}`);
    } catch (err) {
        console.error("Eroare la compilarea SCSS:", err.message);
    }
}

fs.readdirSync(global.folderScss).forEach(fisier => {
    if (fisier.endsWith(".scss")) {
        compileazaScss(fisier);
    }
});

fs.watch(global.folderScss, function(event, fisier) {
    if (fisier && fisier.endsWith(".scss")) {
        compileazaScss(fisier);
    }
});

const vect_foldere = ["temp", "logs", "backup", "fisiere_uploadate"];
for (let folder of vect_foldere) {
    let caleFolder = path.join(__dirname, folder);
    if (!fs.existsSync(caleFolder)) {
        fs.mkdirSync(caleFolder);
        console.log("A fost creat folderul:", caleFolder);
    }
}

const zile = ["duminica", "luni", "marti", "miercuri", "joi", "vineri", "sambata"];

function ziInInterval(ziCurenta, interval) {
    const start = zile.indexOf(interval[0]);
    const end = zile.indexOf(interval[1]);
    const zi = zile.indexOf(ziCurenta);

    if (start <= end) {
        return zi >= start && zi <= end;
    }

    return zi >= start || zi <= end;
}

async function genereazaImaginiGalerie() {
    const caleJson = path.join(__dirname, "resurse/json/galerie.json");
    const galerie = JSON.parse(fs.readFileSync(caleJson, "utf-8"));

    const dataCurenta = new Date();

    // Pentru testare :
    // const dataCurenta = new Date("2026-04-27");

    const ziCurenta = zile[dataCurenta.getDay()];

    let imagini = galerie.imagini.filter(img =>
        img.intervale_zile.some(interval => ziInInterval(ziCurenta, interval))
    );

    if (imagini.length % 2 === 1) {
        imagini.pop();
    }

    const folderMare = path.join(__dirname, "resurse/imagini/galerie");
    const folderMediu = path.join(__dirname, "resurse/imagini/galerie/mediu");
    const folderMic = path.join(__dirname, "resurse/imagini/galerie/mic");

    fs.mkdirSync(folderMediu, { recursive: true });
    fs.mkdirSync(folderMic, { recursive: true });

    for (let img of imagini) {
        const caleImagineMare = path.join(folderMare, img.fisier_imagine);
        const caleImagineMediu = path.join(folderMediu, img.fisier_imagine);
        const caleImagineMic = path.join(folderMic, img.fisier_imagine);

        if (!fs.existsSync(caleImagineMediu)) {
            await sharp(caleImagineMare).resize(300).toFile(caleImagineMediu);
        }

        if (!fs.existsSync(caleImagineMic)) {
            await sharp(caleImagineMare).resize(180).toFile(caleImagineMic);
        }

        img.cale_mare = `${galerie.cale_galerie}/${img.fisier_imagine}`;
        img.cale_mediu = `${galerie.cale_galerie}/mediu/${img.fisier_imagine}`;
        img.cale_mic = `${galerie.cale_galerie}/mic/${img.fisier_imagine}`;
    }

    return imagini;
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

/*
app.get(["/", "/index", "/home"], (req, res) => {
    res.render("pagini/index", { titluPagina: "Acasă" });
}); */

app.get(["/", "/index", "/home"], async function(req, res) {
    const imaginiGalerie = await genereazaImaginiGalerie();

    res.render("pagini/index", {
        titluPagina: "Acasă",
        imaginiGalerie: imaginiGalerie
    });
});

app.get("/galerie", async function(req, res) {
    const imaginiGalerie = await genereazaImaginiGalerie();

    res.render("pagini/galerie", {
        titluPagina: "Galerie",
        imaginiGalerie: imaginiGalerie
    });
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