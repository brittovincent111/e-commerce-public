function salesReport(daily){
    console.log("call reached")
    $.ajax({
        url:'/admin/sales-report/'+daily,
        method:'get',
        
        success:(response)=>{
            if(response.daily){
                alert('hi')
                document.getElementById('salesid').innerHTML=response.data
                
            }
        }
    }) 

}

$(document).ready(function() {
    $('#example').DataTable( {
        dom: 'Bfrtip',
        buttons: [
            'copy', 'csv', 'excel', 'pdf', 'print'
        ]
    } );
} );