"use strict";

function DaoUsuario() {
  this.db = null;
}

//-----------------------------------------------------------------------------------------//

DaoUsuario.prototype.abrirDbAppUsr = async function() {
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
        obterAppUsr();
        resolve(event.target.result);
      }
      else
        reject(Error("object not found"));
    };
  });
  
};

//-----------------------------------------------------------------------------------------//

DaoUsuario.prototype.obterUsr = async function() {
  
  
  
    store = transacao.objectStore("");
  } catch (e) {
    instalacaoApp();
    return;
  }
  store.openCursor().onsuccess = event => {
    var cursor = event.target.result;
    if (cursor) {
      usrApp = cursor.value;
      tfLogin.value = usrApp.login;
      tfLogin.disabled = true;
      btNovo.textContent = "Novo Login";
      estadoBtNovo = "Login";

      if (usrApp.ehMedico == true) {
        labelLogin.innerHTML = "Login (Médico):";
      } else {
        labelLogin.innerHTML = "CPF:";
      }
    } else {
      tfLogin.disabled = false;
      btNovo.textContent = "Nova Conta";
      estadoBtNovo = "Conta";
      instalacaoApp();
    }
  };
}

  
  
  let self = this;
  let resultado = await new Promise(function(resolve, reject) {
    try {
      let transacao = self.db.transaction(["AppUsr"], "readonly");
      let store = transacao.objectStore("AppUsr");
      let array = [];
      store.openCursor().onsuccess = event => {
        var cursor = event.target.result;
        if (cursor) {
          array.push(cursor.value);
          cursor.continue();
        } else {
          resolve(array);
        }
      };
    } catch (e) {
      resolve([]);
    }
  });
  return resultado;
};

//-----------------------------------------------------------------------------------------//
DaoUsuario.prototype.salvarConsulta = async function(codLocalSelecionado, arrayExames, tfExame, codExecutanteSelecionado, codExameSelecionado) {
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

