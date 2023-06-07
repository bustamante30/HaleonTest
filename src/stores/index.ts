import { createStore } from 'vuex';

const store = createStore({
  state() {
    return {
      msalConfig: {
        auth: {
          clientId: 'ac45b74a-2cd1-49f9-b192-e965e5d3ebfa',
          authority:'https://login.microsoftonline.com/8714a216-0445-4269-b96b-7d84bddb6da1',
          responseMode:'query',
          redirectUri: 'http://localhost:3000/'
        },
        cache: {
          cacheLocation: 'localStorage',
          storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
        },
      },
      accessToken:""
    };
  },
  mutations :{
    setAccessToken(state, token): void{
      state.accessToken = token;
    }
  }
});

export default store;
