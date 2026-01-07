import {defineStore} from "pinia";
import {ref} from "vue";

export const useUserStore = defineStore("UserStore",() => {
  const currentUser = ref(null);

  function logout() {

  }

  return {
    currentUser,
    logout,
  }
})
