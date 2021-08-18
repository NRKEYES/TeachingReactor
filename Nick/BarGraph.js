/*
The goal here is to load energies from the JSON file
*/
var key_to_zero_on = 178;
var atoms = [79,6,1] //Manual at the moment

var duration = 3000;

var margin = {top: 50, right: 50, bottom: 50, left: 50},


padding = 50;
paddingMultiplier = 1.4;
// let width = $(".col-6").width();
let width = $(".container").width();
//let height = window.innerHeight * .60;
let height = 1000;

var barHeight = 5,
    barWidth = (width-paddingMultiplier*padding) / 5;


var chart = d3.select('.chart')
  .attr("width", width)
  .attr("height", height - 10)
  .attr("align","center");

var Calculations = [];

var energeticFixxers = new Array();
var realData = new Array();
//Load From JSON
d3.json("GoodStuff.json", function(error, data) {
  for (let key in data) {
    if (data[key].Key > 159) {
      data[key].pop
      realData.push(data[key]);
    } else {
      energeticFixxers.push(data[key])
    }
  }
  data = realData;

  energeticFixxers.forEach(function(eF){
    eF.Energy = 96*eF.Energy;
  });





  let normalizing_value = (energeticFixxers[0].Energy + 2*energeticFixxers[1].Energy); //Super hacky and must be fixed
  console.log(energeticFixxers);
  console.log(normalizing_value)

  var energies = new Array();
  var minEnergy = 0;
  var maxEnergy = 0;
  var maxAtomList = new Array();

  data.forEach(function(d) {

    d.Atoms = d.Atoms;
    d.Coords = d.Coords;
    d.Key = +d.Key;

    //console.log(d.Key);
    //console.log(d.Energy);
    d.Energy = Add_Energy(d) - normalizing_value;;
    d.DrawEnergy = d.Energy;

    if (d.Energy < minEnergy) {
      minEnergy = d.Energy;
      maxAtomList = d.Atoms
    }
    if (d.Energy > maxEnergy) {
      maxEnergy = d.Energy;
    }
  });
  console.log(maxEnergy);
  console.log(minEnergy)




  //fixing the energies
  // Get max key, add to other structures to get to max key
  function Add_Energy(d) {
    temp = d.Energy
    temp = temp*96

    if(d.Key == 176){
      temp += energeticFixxers[2].Energy;
    }
    if(d.Key == 174){
      temp += 2*energeticFixxers[2].Energy;
    }
    if(d.Key == 168){
      temp += energeticFixxers[1].Energy;
    }
    if(d.Key == 166){
      temp += energeticFixxers[1].Energy + energeticFixxers[2].Energy ;
    }
    return (temp) // returns in kJ/mol
  }

  var y = d3.scaleLinear()
    .domain([maxEnergy, minEnergy])
    .range([0+margin.top*paddingMultiplier, height-margin.bottom*paddingMultiplier]);


    data.forEach(function(d1){
      again = false;
      e1 = y(d1.DrawEnergy);
      k1 = d1.Key;
      data.forEach(function(d2){
        e2 = y(d2.DrawEnergy);
        k2 = d2.Key;
        if (d1 == d2) return;
        if (k1 != k2) return;
        if (Math.abs(e1-e2) < 10){
          console.log("Colision")
          if (e1 > e2){
            d1.DrawEnergy -= 5;
          } else if (e2 > e1){
            d2.DrawEnergy -= 5;
          } else{
            d1.DrawEnergy += 5;
            d2.DrawEnergy -= 5;
          }
          again = true;
        }
      });
    });


    data.forEach(function(d) {

      if (d.DrawEnergy < minEnergy) {
        minEnergy = d.DrawEnergy;
        maxAtomList = d.Atoms
      }
      if (d.DrawEnergy > maxEnergy) {
        maxEnergy = d.DrawEnergy;
      }
    });
    console.log(maxEnergy);
    console.log(minEnergy)

    var y = d3.scaleLinear()
      .domain([maxEnergy, minEnergy])
      .range([0+margin.top*paddingMultiplier, height-margin.bottom*paddingMultiplier]);

    var c = d3.scaleLinear()
      .domain([maxEnergy,minEnergy])
      .range([0,1])



  // Now that y scale is defined, create maxAtomList
  var leftAxis = d3.axisLeft(y);

  chart.append("g")
    .attr("transform", function(){return "translate(" + 30 + "," + 0+")"})
    .call(customYAxis);




  //Stacking the structures based on atoms
  var keys = []
  for (var i = 0; i < data.length; i++) {
    value = data[i].Key;
    if (!keys.includes(value)) {
      keys.push(value);
    }
  }



  let spacing = (width-padding) / keys.length;

  let bottomAxisSpacing = math.range(margin.left, width-margin.right, spacing)._data;
  console.log(keys)


  var x = d3.scaleOrdinal()
    .domain([keys[3],keys[2],keys[0],keys[4],keys[1]])
    .range(bottomAxisSpacing); // the underscore data helps to get the actual array



  var bars = chart.selectAll("g")
    .data(data)
    .enter().append("g")
    .attr("transform", function(d, i) {
      return "translate(" + x(d.Key) + ", 0)";
    });



  bars.append("rect")
    .on("click", function(d){ return render(width/2,height/2,d.Atoms,d.Coords);})
    .attr("y", 0)
    .attr("rx", 5)
    .attr("ry", 5)
    .attr("fill", function(d) { return d3.interpolateRdBu((c(d.Energy))); })
    .attr("width", (barWidth-30))
    .attr("height", (barHeight))
    .transition()
    .attr("y",  function(d) {return y(d.DrawEnergy);})
    .duration(duration);


  bars.append("text")
    .attr("class", "E-Label")
    .attr("y", barHeight)
    .attr("x", barWidth-10)
    .attr("dy", ".35em")
    .text(function(d) {
      return Math.round(d.Energy);
    })
    .transition()
    .attr("y", function(d) {
      return y(d.DrawEnergy);
    })
    .duration(duration);


    var xAxis = d3.axisBottom(x)
       .tickValues(["Au₂CH₄ + CH₄",
                    "Au₂CH₂ + H₂ + CH₄",
                    "Au₂C₂H₈",
                    "Au₂C₂H₈ + H₂",
                    "Au₂C2H4 + 2H₂"])

    chart.append("g")
        .attr("class",'test')
        .attr("transform", function(){return "translate("+ barWidth/2 +","+ (height - margin.bottom) +")";})
        .call(customXAxis)


    function customYAxis(g){
      g.call(leftAxis)
      g.select(".domain").remove()
      g.selectAll(".tick text").attr("x", -20)
    }
    function customXAxis(g){
      g.call(xAxis)
      g.select(".domain").remove();
    }







});



Array.prototype.contains = function(val){
  return this.filter(item => item == val).length;
}

function get_atom_differences(a,b){
  var missing = [0,0,0]
  var i = 0;
  atoms.forEach(function(atom){
    if(b.contains(atom) != a.contains(atom)){
      missing[i] = b.contains(atom) - a.contains(atom)
    }
    i++;
  });

  return missing //return indices of energies to add
}
