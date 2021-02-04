"use strict";

function DaoUsuario() {
  this.db = null;
}

//-----------------------------------------------------------------------------------------//

DaoUsuario.prototype.abrirDb = async function() {
  this.db = await new Promise(function(resolve, reject) {
    let requestDB = window.indexedDB.open("AppUsr", 1);
    requestDB.onupgradeneeded = event => {
      console.log("Criando IndexedDB AppUsr");
      let db = event.target.result;
      let store = db.createObjectStore("AppUsr", {
        autoIncrement: true
      });
      store.createIndex("login", "login", { unique: true });
    };

    requestDB.onerror = event => {
      alert("Erro [DBConsulta]: " + event.target.errorCode);
      reject(Error("Error: " + event.target.errorCode));
    };

    requestDB.onsuccess = event => {
      console.log("[DBConsulta] Sucesso");
      if (event.target.result) {
        resolve(event.target.result);
      }
      else
        reject(Error("object not found"));
    };
  });
  
};

//-----------------------------------------------------------------------------------------//

DaoUsuario.prototype.obterUsr = async function() {
  let self = this;
  let resultado = await new Promise(function(resolve, reject) {
    try {
      let transacao = self.db.transaction(["AppUsr"], "readonly");
      let store = transacao.objectStore("AppUsr");
      let array = [];
      store.openCursor().onsuccess = event => {
        let cursor = event.target.result;
        if (cursor) 
          resolve(cursor.value);
        else 
          resolve(null);
      };
    } catch (e) {
      resolve(null);
    }
  });
  return resultado;
};

//-----------------------------------------------------------------------------------------//

DaoUsuario.prototype.salvarUsr = async function(codLocalSelecionado, arrayExames, tfExame, codExecutanteSelecionado, codExameSelecionado) {

  
  
  
  
  function incluirDbApp {
  transacao = db.transaction(["AppUsr"], "readwrite");
  transacao.onerror = event => {
    alert("Erro [AppUsr]: " + event.target.errorCode);
  };
  store = transacao.objectStore("AppUsr");
  var objectStoreRequest = store.clear();
  objectStoreRequest.onsuccess = function(event) {
    objectStoreRequest = store.add({
      login: login,
      senha: fnMD5(senha),
      nome: nome,
      email: email,
      celular: celular,
      rua: rua,
      numero: numero,
      complemento: complemento,
      bairro: bairro,
      cep: cep,
      ehMedico: ehMedico
    });
    objectStoreRequest.onsuccess = function(event) {
      window.location.href = "inicio.html";
    };
  };
}

  
  
  
  
  
  
  let self = this;
  let resultado = await new Promise(async function(resolve, reject) {
    try {
      let transacao = self.db.transaction(["Consulta"], "readwrite");
      let store = transacao.objectStore("Consulta");
      let request = await store.add({
        id: 1,
        codLocalSelecionado: codLocalSelecionado,
        arrayExames: arrayExames,
        tfExame: tfExame,
        codExecutanteSelecionado: codExecutanteSelecionado,
        codExameSelecionado: codExameSelecionado
      });
      transacao.oncomplete = function(event) {
        resolve("Ok");
      };
      transacao.onerror = function(event) {
        resolve([]);
      };
      // resolve("Ok");
    } catch (e) {
      console.log("salvarConsulta: " + e);
      resolve([]);
    }
  });
  return resultado;
};

//-----------------------------------------------------------------------------------------//

DaoUsuario.prototype.limparConsulta = function() {
  var requestDB = window.indexedDB.deleteDatabase("ConsultaUsr", 1);
  requestDB.onsuccess = function(event) {};
  requestDB.onerror = function(event) {};
};

//-----------------------------------------------------------------------------------------//

