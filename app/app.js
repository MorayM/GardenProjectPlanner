var data = {
    allPlants: [],
    allWorkers: [],
    allGardens: [
        {name: 'Garden 1', plants: []}, 
        {name: 'Garden 2', plants: []}, 
        {name: 'Garden 3', plants: []}, 
        {name: 'Garden 4', plants: []}, 
        {name: 'Garden 5', plants: []}, 
        {name: 'Garden 6', plants: []}, 
        {name: 'Garden 7', plants: []}, 
        {name: 'Garden 8', plants: []}, 
        {name: 'Garden 9', plants: []}, 
        {name: 'Garden 10', plants: []}, 
        {name: 'Garden 11', plants: []}, 
        {name: 'Garden 12', plants: []}, 
        {name: 'Garden 13', plants: []}, 
        {name: 'Other', plants: []}
    ]
};  

var pt;
var gt;
var activeGarden = 0;
var jsonFile;
var csvFile;
var gardenCsv;

$(document).ready(function(){
    
    if (localStorage.getItem('gardenData')) {
        console.log(localStorage.getItem('gardenData'));
        data = JSON.parse(localStorage.getItem('gardenData'));
    }
    
    $('#addLatin').autocomplete({
        source: function(request, response) {
            var matchingPlants = $.grep(data.allPlants, function(elem, index){
                return elem[0].indexOf(request.term) >= 0;
            })
            
            var matchingNames = $.map(matchingPlants, function(elem, index) {
                return elem[0];
            })
            return response(matchingNames);
        },
        select: function (evt, ui) {
            var plant = getPlantByLatin(ui.item.label);
            $('#addCommon').val(plant[1]);
            $('#addSpread').val(plant[2]);
            $('#addHeight').val(plant[3]);
        }
    });
    
    pt = $('#allPlants').DataTable({
        'data': data.allPlants,
        'columns': [
            {'className': 'italic'},
            null,
            null,
            null,
            null,
            {'orderable': false}
        ],
        'lengthMenu':[[10, 25, 50, -1], [10, 25, 50, 'All']]
    })
    
    $('#addPlant').unbind('click').on('click', addNewPlant);
    $('#gardens').on('click', '.select-garden', loadGardenData);
    $('#gardens').on('click', '#addPlantToGarden', addPlantToGarden);
    $('#gardens').on('click', '.deleteGardenRow', removePlantFromGarden);
    $('#allPlants tbody').unbind('click').on('click', 'button.deleteRow', removePlant);
    
    function loadGardenData() {
        if (gt) {
            gt.destroy();
        }
        
        activeGarden = $(this).attr('gardenindex') ? parseInt($(this).attr('gardenindex')) : 0;
        $('.garden-name').text(data.allGardens[activeGarden].name);
        $('#downloadGarden').attr('download', data.allGardens[activeGarden].name + '.csv');
        gt = $('#gardenPlants').DataTable({
            'data': data.allGardens[activeGarden].plants,
            'columns': [
                {'className': 'italic'},
                null,
                null,
                null,
                null,
                null,
                {'orderable': false}
            ],
            'lengthMenu':[[10, 25, 50, -1], [10, 25, 50, 'All']]
        });
        setGardenDownload();
    }
    
    function addPlantToGarden() {        
        if (parseInt($('#addCount').val()) > 0) {
            
            var newPlant = [
                $('#addLatin').val(),
                $('#addCommon').val(),
                parseInt($('#addId').val()),
                parseFloat($('#addSpread').val()),
                parseFloat($('#addHeight').val()),
                parseInt($('#addCount').val()),
                '<button class="deleteGardenRow">x</button>'
            ]
            
            data.allGardens[activeGarden].plants.push(newPlant);
            // add to table
            gt.row.add(newPlant).draw();
            
            //is plant already known?
            var index = getPlantIndexByLatin($('#addLatin').val());
            newPlant = newPlant.slice();
            newPlant.splice(2, 1);
            newPlant[5] = '<button class="deleteRow">x</button>';
            if (index >= 0) {
                //update total
                data.allPlants[index][4] += newPlant[4];
                pt.row(index).data(newPlant).draw();
            } else {
                // add
                data.allPlants.push(newPlant);
                pt.row.add(newPlant).draw();
            }
            
            //clear form
            $('#addLatin').val('');
            $('#addCommon').val('');
            $('#addId').val('');
            $('#addSpread').val('');
            $('#addHeight').val('');
            $('#addCount').val('');
        }
    }
    
    function removePlantFromGarden() {
        // remove from table
        var row = gt.row($(this).parents('tr')).remove().draw();
        
        var gardenIndex = getActiveGardenPlantIndexByLatin($(this).parents('tr').children().first().text());
        var count = data.allGardens[activeGarden].plants[gardenIndex][5];
        
        // remove from data behind
        data.allGardens[activeGarden].plants.splice(gardenIndex, 1);
                
        // update all plants list
        var index = getPlantIndexByLatin($(this).parents('tr').children().first().text());
        data.allPlants[index][4] -= count;
        pt.row(index).data(data.allPlants[index]).draw();
    }
    
    function addNewPlant() {
        data.allPlants.push([
            $('#latin').val(),
            $('#common').val(),
            parseFloat($('#spread').val()),
            parseFloat($('#height').val()),
            0,
            '<button class="deleteRow">x</button>'
        ]);
        
        pt.row.add([$('#latin').val(), $('#common').val(), parseFloat($('#spread').val()), parseFloat($('#height').val()), 0, '<button class="deleteRow">x</button>']).draw();
        
        //clear form
        $('#latin').val('');
        $('#common').val('');
        $('#spread').val('');
        $('#height').val('');        
    }
    
    function removePlant() {
        var row = pt.row($(this).parents('tr')).remove().draw();
        
        var index = getPlantIndexByLatin($(this).parents('tr').children().first().text());
        if (index >= 0) {
            data.allPlants.splice(index, 1);
            
            for (var i = 0; i < data.allGardens.length; i++) {
                var plantIndexInGarden = getGardenPlantIndexByLatin($(this).parents('tr').children().first().text(), i);
                if (plantIndexInGarden >= 0) {
                    data.allGardens[i].plants.splice(plantIndexInGarden, 1);
                }
            }
            
            if (gt) {
                gt.destroy();
            }
            
            gt = $('#gardenPlants').DataTable({
                'data': data.allGardens[activeGarden].plants,
                'columns': [
                    {'className': 'italic'},
                    null,
                    null,
                    null,
                    null,
                    null,
                    {'orderable': false}
                ]
            });
        }
    }
    
    function backup() {
        var content = JSON.stringify(data);
        var blob = new Blob([content], {type: 'application/json'});
        
        if (jsonFile) {
            window.URL.revokeObjectURL(jsonFile);
        }
        
        jsonFile = window.URL.createObjectURL(blob);
        
        $('#saveAll').attr('href', jsonFile);
    }
    
    function setLibraryDownload() {
        var csvString = 'Latin name, Common name, Spread, Height, Count\n';
        for (var i = 0; i < data.allPlants.length; i++) {
            csvString += data.allPlants[i].slice(0, 5).join();
            csvString += '\n';
        }
        
        csvString = csvString.replace(/\u201C/g, '"');
        csvString = csvString.replace(/\u201D/g, '"');
        
        var blob = new Blob([csvString], {type: 'text/csv'});
        
        if (csvFile) {
            window.URL.revokeObjectURL(csvFile);
        }
        
        csvFile = window.URL.createObjectURL(blob);
        
        $('#csvDownload').attr('href', csvFile);
    }
    
    function setGardenDownload() {
        var csvString = 'Key,Latin name,Common name,Spread,Height,Count\n';
        for (var i = 0; i < data.allGardens[activeGarden].plants.length; i++) {
            csvString += data.allGardens[activeGarden].plants[i].slice(2, 3) + ',';
            csvString += data.allGardens[activeGarden].plants[i].slice(0, 2).join() + ',';
            csvString += data.allGardens[activeGarden].plants[i].slice(3, 6).join() + '\n';
        }
        
        csvString = csvString.replace(/\u201C/g, '"');
        csvString = csvString.replace(/\u201D/g, '"');
        
        var blob = new Blob([csvString], {type: 'text/csv'});
        
        if (gardenCsv) {
            window.URL.revokeObjectURL(gardenCsv);
        }
        
        gardenCsv = window.URL.createObjectURL(blob);
        
        $('#downloadGarden').attr('href', gardenCsv);
    }
    
    function hideBackup() {
        $('#dlLink').attr('href', '#');
        $('#dlLink').attr('style', 'display:none');
    }
    
    function hideCsv() {
        $('#csvDlLink').attr('href', '#');
        $('#csvDlLink').attr('style', 'display:none');
    }
    
    function getPlantByLatin(latin) {
        var index = getPlantIndexByLatin(latin);
        if (index >= 0) {
            return data.allPlants[index];
        } else {
            return null;
        }
    }
    
    function getPlantIndexByLatin(latin) {
        for (var i = 0; i < data.allPlants.length; i++) {
            if (data.allPlants[i][0] === latin) {
                return i;
            }
        }
        return -1;        
    }
    
    function getActiveGardenPlantIndexByLatin(latin) {
        return getGardenPlantIndexByLatin(latin, activeGarden); 
    }
    
    function getGardenPlantIndexByLatin(latin, gardenIndex) {
        for (var i = 0; i < data.allGardens[gardenIndex].plants.length; i++) {
            if (data.allGardens[gardenIndex].plants[i][0] === latin) {
                return i;
            }
        }
        return -1; 
    }
    
    function createGardenButtons() {
        for (var i = 0; i < data.allGardens.length; i++) {
            $('#gardenButtons').append('<button class="btn btn-success select-garden" gardenindex="' + i + '">' + data.allGardens[i].name + '</button>');
        }
    }
    
    createGardenButtons();
    loadGardenData();
    
    var intervalId = setInterval(function() {
        localStorage.setItem('gardenData', JSON.stringify(data));
        backup();
        setLibraryDownload();
        setGardenDownload();
        console.log('saved');
    }, 1000);
    console.log(intervalId);
    
    function clearCache() {
        localStorage.removeItem('gardenData');
        clearInterval(intervalId);
    }
});