var data = {
    allPlants: [],
    allWorkers: [],
    allGardens: []
};  

var pt;

$(document).ready(function(){
    
    if (localStorage.getItem('gardenData')) {
        console.log(localStorage.getItem('gardenData'));
        data = JSON.parse(localStorage.getItem('gardenData'));
    }
    
    pt = $('#allPlants').DataTable({
        'data': data.allPlants,
        'columns': [
            {'className': 'italic'},
            null,
            null,
            null,
            null,
            {'orderable': false}
        ]
    })
    
    $('#addPlant').unbind('click').on('click', addNewPlant);
    
    $('#allPlants tbody').unbind('click').on('click', 'button.deleteRow', removeRow);
    
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
    }
    
    function removeRow() {
        var row = pt.row($(this).parents('tr')).remove().draw();
        
        for (var i = 0; i < data.allPlants.length; i++) {
            if (data.allPlants[i][0] === $(this).parents('tr').children().first().text()) {
                data.allPlants.splice(i, 1);
            }
        }
    }
    
    var intervalId = setInterval(function() {
        localStorage.setItem('gardenData', JSON.stringify(data));
        console.log('saved');
    }, 5000);
    console.log(intervalId);
});