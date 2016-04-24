(function() {
    
var data = {
    allPlants: [],
    allWorkers: [],
    allGardens: []
};  

var plantRow = '<tr><td style="font-style: italic">{{plant.latin}}</td><td>{{plant.common}}</td><td>{{plant.spread}}</td><td>{{plant.height}}</td><td>{{plant.count}}</td><td></td></tr>';

$(document).ready(function(){    
    function addNewPlant() {
        data.allPlants.push(vm.newPlant);
        newPlant = {};
    }
});
})();