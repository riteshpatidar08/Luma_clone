import {createSlice} from '@reduxjs/toolkit' ;

const initialState = {
    id : null ,
    email : null , 
    role : null || localStorage.getItem('role'),
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
        state.role = action.payload.user.roles
        localStorage.setItem('role' , action.payload.user.roles)
        localStorage.setItem('token' , action.payload.token)
      }  
    },
    updateRole  : function (state,action){

      console.log(action.payload.user)
  
    }
})

export const {updateToken , updateRole} = authSlice.actions
export default authSlice.reducer  
//token , id , email