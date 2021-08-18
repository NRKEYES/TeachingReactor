




window.onload = function(){



    console.log(document.getElementById("body").clientHeight)
    console.log(document.getElementById("body").clientWidth)
    //document.getElementById("body") = document.getElementById("body") + '<img src="skull.png">'

    document.getElementById("body").addEventListener("mousemove", mouseover )
    //document.getElementById("main_canvas").style("height=100%")

    var c = document.getElementById("main_canvas");
    var ctx = c.getContext("2d");

    //Draw Rectangle
    ctx.beginPath();
    ctx.rect(0, 0, 50, 50);
    ctx.fillStyle = "#FF0000";
    ctx.fill();
    ctx.closePath();

};


function mouseover(event){


    console.log(document.getElementById("x").innerText = "X="+event.clientX)
    console.log(document.getElementById("y").innerText = "Y="+event.clientY)
    



    // var ctx = c.getContext("2d");
    // var img = document.getElementById("skull");

    // ctx.drawImage(img, event.clientX, event.clientX, 50, 84);
}

