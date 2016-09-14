/*jslint browser, for:true, this:true */
/*global $ */
/*global URL*/

document.addEventListener("DOMContentLoaded", function () {
    'use strict';
    var canvas; // canvas principale
    var ctx; // context principal
    var outil;
    var def_outil = "pinceau"; //outil par défaut
    var color = "#000"; // couleur par défaut
    var canvasTMP; // canvas de prévisualisation
    var ctxTMP; // context de prévisualisation
    var fill = "vide"; // outil de remplissage (vide par défaut)
    var value = document.getElementById("value");
    var range = document.getElementById("taille");
    var saving = document.getElementById("save");
    range.addEventListener("change", function ()
    {
        value.innerHTML = this.value;
    });
    var activated = false;
    var canvasSIM;
    var ctxSIM;


    function colorGenerator() {
        //pour chaque carré de couleur
        $("#couleurs a").each(function () {
            //je lui attribut une couleur de fond
            $(this).css("background", $(this).attr("data-couleur"));

            //et au click
            $(this).click(function () {
                //je change la couleur du pinceau :
                color = $(this).attr("data-couleur");

                //et les classes CSS :
                $("#couleurs a").removeAttr("class", "");
                $(this).attr("class", "actif");

                return false;
            });
        });
    }
    colorGenerator();
    //fonction qui permet de stocker l'image prévisualisé
    function stockage() {
        ctxTMP.drawImage(canvas, 0, 0);
        ctxTMP.drawImage(canvasSIM, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctxSIM.clearRect(0, 0, canvas.width, canvas.height);
    }
    //event appelé suivant l'outil utilisé et les evenements de souris
    function eventOnCanvas(e) {
        if (e.layerX || e.layerY === 0) {
            e.lX = e.layerX; //l'index X de la souris suivant le calque
            e.lY = e.layerY; //l'index Y de la souris suivant le calque
        }
        //la fonction aura le nom de la value de l'outil
        var funct = outil[e.type];
        if (funct) {
            funct(e);
        }
    }
    //création de l'objet outil;
    var outils = {};

    //changement d'outil générique
    function changement_outil() {
        if (outils[this.value]) {
            outil = new outils[this.value]();
        }
    }

    function save() {
        saving.addEventListener("click", function () {
            var c = canvasTMP.toDataURL();
            saving.href = c;
        });
    }

    outils.pinceau = function () {
        outil = this;
        this.go = false; // variable qui permet de commencer le dessin

        this.mousedown = function (e) {
            outil.go = true; //on l'active pour dessiner
            ctx.beginPath(); //on commence le chemin
            ctx.moveTo(e.lX, e.lY); //index de la souris
            ctxSIM.beginPath(); //on commence le chemin
            ctxSIM.moveTo(canvas.width - e.lX, e.lY);
        };

        this.mousemove = function (e) {
            if (outil.go) {
                ctx.globalCompositeOperation = 'source-over'; // dessin en source-over
                ctx.strokeStyle = color; //attirbut de couleur sur le trait
                ctx.lineWidth = range;
                if (activated) {
                    ctxSIM.globalCompositeOperation = 'source-over'; // dessin en source-over
                    ctxSIM.lineJoin = "round";
                    ctxSIM.lineCap = "round";
                    ctxSIM.strokeStyle = color; //attirbut de couleur sur le trait
                    ctxSIM.lineWidth = range;
                    ctxSIM.lineTo(canvas.width - e.lX, e.lY);
                    ctxSIM.stroke(); // on dessine
                    // ctx2.moveTo(e.lX, e.lY);
                }
                ctx.lineJoin = "round";
                ctx.lineCap = "round";
                ctx.lineTo(e.lX, e.lY); //on par de moveTo et on trace jusqu'à l'index voulu
                ctx.stroke(); // on dessine
            }
        };

        this.mouseup = function (e) {
            if (outil.go) {
                outil.mousemove(e);
                outil.go = false; // on passe la variable à false pour arrêter le dessin
                stockage(); //on appel la fonction de stockage dans le canvas
            }
        };
    };

    outils.rectangle = function () {
        outil = this;
        this.go = false; // fuck start c'est une fonction

        this.mousedown = function (e) {
            outil.go = true;
            outil.x0 = e.lX;
            outil.y0 = e.lY;
        };

        this.mousemove = function (e) {
            if (!outil.go) {
                return;
            }

            var x = Math.min(e.lX, outil.x0);
            var y = Math.min(e.lY, outil.y0);
            var w = Math.abs(e.lX - outil.x0);
            var h = Math.abs(e.lY - outil.y0);

            ctx.clearRect(0, 0, canvas.width, canvas.width); // on clear le premier canvas pour pouvoir travailler sur l'autre sans surchage

            if (!w || !h) { //si Width et Heigth ne sont pas définis on ne dessine pas
                return;
            }

            if (fill === "vide") { //systeme de remplissage
                if (activated) {
                    ctxSIM.clearRect(0, 0, canvas.width, canvas.width); // on clear le premier canvas pour pouvoir travailler sur l'autre sans surchage
                    ctxSIM.strokeStyle = color;
                    ctxSIM.lineWidth = range;
                    ctxSIM.globalCompositeOperation = 'source-over';
                    ctxSIM.strokeRect(Math.min(canvas.width - e.lX, canvas.width - outil.x0), y, Math.abs((canvas.width - e.lX) - (canvas.width - outil.x0)), h);
                }
                ctx.globalCompositeOperation = 'source-over';
                ctx.strokeStyle = color;
                ctx.lineWidth = range;
                ctx.strokeRect(x, y, w, h);
            } else {
                if (activated) {
                    ctxSIM.clearRect(0, 0, canvas.width, canvas.width); // on clear le premier canvas pour pouvoir travailler sur l'autre sans surchage
                    ctxSIM.lineWidth = range;
                    ctxSIM.fillStyle = color;
                    ctxSIM.fillRect(Math.min(canvas.width - e.lX, canvas.width - outil.x0), y, Math.abs((canvas.width - e.lX) - (canvas.width - outil.x0)), h);
                }
                ctx.globalCompositeOperation = 'source-over';
                ctx.fillStyle = color;
                ctx.fillRect(x, y, w, h);
            }
        };

        this.mouseup = function (e) {
            if (outil.go) {
                outil.mousemove(e);
                outil.go = false;
                stockage();
            }
        };
    };

    outils.ligne = function () {
        outil = this;
        this.go = false;

        this.mousedown = function (e) {
            outil.go = true;
            outil.x0 = e.lX;
            outil.y0 = e.lY;
        };

        this.mousemove = function (e) {
            if (!outil.go) {
                return;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (activated) {
                ctxSIM.clearRect(0, 0, canvas.width, canvas.height);
                ctxSIM.beginPath();
                ctxSIM.moveTo(canvas.width - outil.x0, outil.y0);
                ctxSIM.lineWidth = range;
                ctxSIM.lineTo(canvas.width - e.lX, e.lY);
                ctxSIM.strokeStyle = color;
                ctxSIM.lineJoin = "round";
                ctxSIM.lineCap = "round";
                // ctxSIM.globalCompositeOperation = 'source-over';
                ctxSIM.stroke();
                ctxSIM.closePath();
            }

            ctx.beginPath();
            ctx.moveTo(outil.x0, outil.y0);
            ctx.lineWidth = range;
            ctx.lineTo(e.lX, e.lY);
            ctx.strokeStyle = color;
            ctx.lineJoin = "round";
            ctx.lineCap = "round";
            // ctx.globalCompositeOperation = 'source   -over';
            ctx.stroke();
            ctx.closePath();
        };

        this.mouseup = function (e) {
            if (outil.go) {
                outil.mousemove(e);
                outil.go = false;
                stockage();
            }
        };
    };

    outils.cercle = function () {
        outil = this;
        this.go = false;

        this.mousedown = function (e) {
            outil.go = true;
            outil.x0 = e.lX;
            outil.y0 = e.lY;
        };

        this.mousemove = function (e) {
            if (!outil.go) {
                return;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            var x = outil.x0 - e.lX;
            var y = outil.y0 - e.lY;
            var r = Math.sqrt((x * x) + (y * y)); //racine carré

            if (!r) {
                return;
            }
            ctx.beginPath();
            ctx.arc(outil.x0, outil.y0, r, 0, Math.PI * 2);

            if (fill === "vide") {
                if (activated) {
                    ctxSIM.clearRect(0, 0, canvas.width, canvas.height);
                    ctxSIM.beginPath();
                    ctxSIM.arc(canvas.width - outil.x0, outil.y0, r, 0, Math.PI * 2);
                    ctxSIM.lineWidth = range;
                    ctxSIM.strokeStyle = color;
                    ctxSIM.stroke();
                }
                ctx.lineWidth = range;
                ctx.strokeStyle = color;
                ctx.stroke();
            } else {
                if (activated) {
                    ctxSIM.clearRect(0, 0, canvas.width, canvas.height);
                    ctxSIM.beginPath();
                    ctxSIM.arc(canvas.width - outil.x0, outil.y0, r, 0, Math.PI * 2);
                    ctxSIM.lineWidth = range;
                    ctxSIM.fillStyle = color;
                    ctxSIM.fill();
                }
                ctx.fillStyle = color;
                ctx.fill();
            }
        };

        this.mouseup = function (e) {
            if (outil.go) {
                outil.mousemove(e);
                outil.go = false;
                stockage();
            }
        };
    };

    outils.gomme = function () {
        outil = this;
        this.go = false; // fuck start c'est une fonction

        this.mousedown = function (e) {
            outil.go = true;
            ctxTMP.beginPath();
            ctxTMP.moveTo(e.lX, e.lY);
        };

        this.mousemove = function (e) {
            if (outil.go) {
                ctxTMP.globalCompositeOperation = 'destination-out'; //outil de gomme en destination-out pour effacer
                ctxTMP.lineWidth = range;
                ctxTMP.lineJoin = "round";
                ctxTMP.lineCap = "round";
                ctxTMP.lineTo(e.lX, e.lY);
                ctxTMP.stroke();
            }
        };

        this.mouseup = function (e) {
            if (outil.go) {
                outil.mousemove(e);
                outil.go = false;
                ctxTMP.globalCompositeOperation = 'source-over'; //obligé de le repasser en source-over sinon il efface tout
                stockage();
            }
        };
    };

    function init() {
        // $("#container").hide();
        // récupération du canvas principal
        canvasTMP = document.getElementById("can");
        ctxTMP = canvasTMP.getContext("2d");
        // récupération du canvas de symétrie
        canvasSIM = document.getElementById("canSIM");
        ctxSIM = canvasSIM.getContext("2d");
        //récupération des lignes pour la symétrie
        var canvasLines = document.getElementById("canLine");
        var ctxLine = canvasLines.getContext("2d");
        canvasLines.style.display = "none";
        //outil de grossissage (et ouais les mecs !) du pinceau
        value = document.getElementById("value");
        // value.innerHTML += range;
        range = document.getElementById("taille");
        range.addEventListener("change", function () {
            range = document.getElementById("taille").value;
        });
        // facilité choisi pour l'outil de remplissage*
        var empty = document.getElementById("vide");
        var plein = document.getElementById("plein");
        // création et selection du canvas de prévisualisation
        var cont = canvasTMP.parentNode;
        canvas = document.createElement('canvas');
        canvas.id = "canTMP";
        canvas.width = canvasTMP.width;
        canvas.height = canvasTMP.height;
        cont.appendChild(canvas);
        ctx = canvas.getContext("2d");
        // outil de sélection des outils
        var selector = document.getElementById("toolSelector");
        selector.addEventListener("change", changement_outil, false);
        //gestion de la selection des outils génériquement
        if (outils[def_outil]) {
            outil = new outils[def_outil]();
            selector.value = def_outil;
        }
        //*
        empty.addEventListener("click", function () {
            fill = "vide";
        });

        plein.addEventListener("click", function () {
            fill = "plein";
        });
        //ajout des event pour les outils
        canvas.addEventListener("mousedown", eventOnCanvas, false);
        canvas.addEventListener("mousemove", eventOnCanvas, false);
        canvas.addEventListener("mouseup", eventOnCanvas, false);
        //option de sauvegarde
        saving.addEventListener("click", function () {
            save();
            saving.href = canvasTMP.toDataURL();
        });

        document.getElementById("symetrie").addEventListener("click", function () {
            if (activated === false) {
                activated = true;
            } else {
                activated = false;
                canvasLines.style.display = "none";
            }
        });


        canvas.addEventListener("drop", function (e) {
            var img = document.createElement("img");
            var files = e.dataTransfer.files;
            if (files.length > 0) {
                var file = files[0];
                img.src = URL.createObjectURL(file);
            }
            e.preventDefault();
            img.addEventListener("load", function () {
                ctxTMP.drawImage(img, e.layerX - img.width / 2, e.layerY - img.height / 2);
            }, false);
        }, false);


        canvas.addEventListener("dragover", function (e) {
            e.preventDefault();
        }, false);
    }
    init();
});