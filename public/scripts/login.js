"use strict";

// -----------------------------------------------------------------------------------------//

var requestDB = null;
var db = null;
var store = null;
var transacao = null;
var usrApp = null;

const divConteudo = document.getElementById("divConteudo");
const divInstrucao = document.getElementById("divInstrucao");
const tfLogin = document.getElementById("tfLogin");
const tfSenha = document.getElementById("tfSenha");
const btOk = document.getElementById("btOk");
const btNovo = document.getElementById("btNovo");
const labelLogin = document.getElementById("lbLogin");

var fnMD5 = new Function('a', 'return md5(a)');
var estadoBtNovo = "Conta";

// -----------------------------------------------------------------------------------------//

function abrirDbApp() {
  requestDB = window.indexedDB.open("AppUsr", 1);

  requestDB.onupgradeneeded = event => {
    console.log("[app usr] Criando IndexedDB AppUsr");
    db = event.target.result;
    store = db.createObjectStore("AppUsr", {
      autoIncrement: true
    });
    store.createIndex("login", "login", { unique: true });
  };

  requestDB.onerror = event => {
    console.log("Erro [AppUsr]: " + event.target.errorCode);
    alert("Erro [AppUsr]: " + event.target.errorCode);
  };

  requestDB.onsuccess = event => {
    console.log("[AppUsr] Sucesso");
    db = event.target.result;
    obterAppUsr();
  };
}

// -----------------------------------------------------------------------------------------//

function obterAppUsr() {
  try {
    transacao = db.transaction(["AppUsr"], "readonly");
    store = transacao.objectStore("AppUsr");
  } catch (e) {
    console.log("[AppUsr] Erro");
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
      
      if(usrApp.ehMedico == true) {
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

// -----------------------------------------------------------------------------------------//

function incluirDbApp(login, senha, nome, email, celular, rua, numero, complemento, bairro, cep, ehMedico) {
  transacao = db.transaction(["AppUsr"], "readwrite");
  transacao.oncomplete = event => {
    console.log("[AppUsr] Sucesso");
  };
  transacao.onerror = event => {
    console.log("[AppUsr] Erro");
  };
  store = transacao.objectStore("AppUsr");
  var objectStoreRequest = store.clear();
  objectStoreRequest.onsuccess = function(event) {
	  objectStoreRequest = store.add({
		  login: login,
		  senha: fnMD5(senha),
		  nome: nome,
		  email: email,
		  celular : celular,
      rua: rua,
      numero : numero,
      complemento : complemento,
      bairro : bairro,
      cep : cep,
		  ehMedico: ehMedico
	  });
	  objectStoreRequest.onsuccess = function(event) {
		  window.location.href = 'inicio.html';
	  }
   };
}

// -----------------------------------------------------------------------------------------//

function instalacaoApp() {
  divInstrucao.innerHTML =
    "<center><b>Efetue seu Login ou Crie sua Conta</b></center>";
}

// -----------------------------------------------------------------------------------------//

function renderEfetuarLogin(re) {
  if (data == null) {
    alert("Problemas de Conexão com o Servidor");
    return;
  }
  if (data.hasOwnProperty("erro")) {
    alert(data.erro);
 
    if(data.erro.includes("TIMEOUT")) {
      divInstrucao.innerHTML = "<b>Tempo de Conexão Excedido<br/>com o Servidor. Tente mais tarde.</b>";     
      return;
    }
    
    if(usrApp == null || tfLogin.value != usrApp.login || fnMD5(tfSenha.value) != usrApp.senha) {
      divInstrucao.innerHTML = "<b>Login não autorizado</b>";     
      return;
    }
    
    if(tfLogin.value == usrApp.login && fnMD5(tfSenha.value) == usrApp.senha) {
      doDeterminarUsuarioLocal().then(retorno => {
        window.location.href = "inicio.html";
        return;
      });
    } 
  }

  if (data.hasOwnProperty("status")) {
    if (data.status == "success") {
        incluirDbApp(
          tfLogin.value,
          null,
          data.nome,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          true 
        );
    }
  }
}

// -----------------------------------------------------------------------------------------//

function doDeterminarUsuarioLocal() {
  console.log("(app.js) Executando Determinar Usuário Local ");
  return fetch(
    "/determinarUsuarioLocal/" +
      usrApp.login +
      "/" +
      usrApp.senha +
      "/" +
      usrApp.nome +
      "/" +
      usrApp.email +
      "/" +
      usrApp.celular +
      "/" +
      usrApp.endereco
  )
    .then(response => {
      console.log("(app.js) determinarUsuarioLocal response");
      return response.json();
    })
    .catch(() => {
      console.log("(app.js) determinarUsuarioLocal catch");
      return null;
    });
}

// -----------------------------------------------------------------------------------------//

async function doEfetuarLogin(login, senha) {
  let response = await fetch("/login/" + login + "/" + fnMD5(senha));
  return await response.json();
}

// -----------------------------------------------------------------------------------------//

async function callbackOk() {
  console.log("(app.js) callbackOk");
  const login = tfLogin.value;
  const senha = tfSenha.value;
  
  colocarEspera();
  // chama efetuarLogin e atualiza a tela
  let retorno = await doEfetuarLogin(login, senha);
  renderEfetuarLogin(retorno);
  retirarEspera();
}

// -----------------------------------------------------------------------------------------//

function callbackCriar() {
  if(estadoBtNovo == "Conta") 
	  window.location.href = "cadusuario.html";
  else {
	  // estadoBtNovo == "Login";
	  labelLogin.innerHTML = "Login:";
      tfLogin.value = "";
      tfLogin.disabled = false;
      btNovo.textContent = "Nova Conta";
      estadoBtNovo = "Conta";
      divInstrucao.innerHTML = "<center><b>Efetue seu Login ou Crie sua Conta</b></center>";
  }
}

// -----------------------------------------------------------------------------------------//

function colocarEspera() {
  $("div.circle").addClass("wait");
}

// -----------------------------------------------------------------------------------------//

function retirarEspera() {
  $("div.circle").removeClass("wait");
}

// -----------------------------------------------------------------------------------------//

btOk.addEventListener("click", callbackOk);
btNovo.addEventListener("click", callbackCriar);
tfSenha.addEventListener("keyup", function(event){if(event.keyCode === 13){callbackOk();}});
