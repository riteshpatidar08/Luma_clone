import {createSlice} from '@reduxjs/toolkit' ;

const initialState = {
    id : null ,
    email : null , 
    token : null  || localStorage.getItem('token') ,
    isAuthenticated  : localStorage.getItem('token') ? true : false
}


const authSlice = createSlice({
    name : 'auth',
    initialState ,
    reducers : {
      updateToken  : function(state,action){
        console.log('state updated...')
        console.log(state,action)
        state.token = action.payload.token
        
        localStorage.setItem('token' , action.payload.token)
      }  
    }
})

export const {updateToken} = authSlice.actions
export default authSlice.reducer  
//token , id , email