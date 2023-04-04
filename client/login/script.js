


    $(document).ready(function() {
        //set initial state.
    
        $('#toggle').change(function() {
            if(this.checked) {
                
            $('#password').prop('type', 'text');       
            } 
            else{
            $('#password').prop('type', 'password');       

            }
        });
    });