"use strict";

// -----------------------------------------------------------------------------------------//

const novoDaoUsuario = new Function("", "return new DaoUsuario()");
const novaViewEfetuarLogin = new Function("", "return new ViewEfetuarLogin()");
const fnMD5 = new Function("a", "return md5(a)");

// -----------------------------------------------------------------------------------------//


// -----------------------------------------------------------------------------------------//

function UcEfetuarLogin() {
  this.viewEfetuarLogin = novaViewEfetuarLogin(this);
  this.usrApp = null;
  this.daoUsuario = novoDaoUsuario();
  this.iniciar();
}

// -----------------------------------------------------------------------------------------//

UcEfetuarLogin.prototype.iniciar = async function() {
  await this.daoUsuario.abrirDb();
  this.usrApp = await this.daoUsuario.obterUsr();
  this.viewEfetuarLogin.iniciar(this.usrApp);
}

// -----------------------------------------------------------------------------------------//

iniciar();

// -----------------------------------------------------------------------------------------//

function instalacaoApp() {
  divInstrucao.innerHTML =
    "<center><b>Efetue seu Login ou Crie sua Conta</b></center>";
}

// -----------------------------------------------------------------------------------------//

function renderEfetuarLogin(resposta) {
  if (resposta == null) {
    alert("Problemas de Conexão com o Servidor");
    return;
  }
  
  if (resposta.hasOwnProperty("erro")) {
    alert(resposta.erro);

    if (resposta.erro.includes("TIMEOUT")) {
      divInstrucao.innerHTML =
        "<b>Tempo de Conexão Excedido<br/>com o Servidor. Tente mais tarde.</b>";
      return;
    }

    if(usrApp == null || tfLogin.value != usrApp.login || fnMD5(tfSenha.value) != usrApp.senha) {
      divInstrucao.innerHTML = "<b>Login não autorizado</b>";
      return;
    }
  }

  if (tfLogin.value.replace(/\.|-/g, "") == usrApp.login.replace(/\.|-/g, "") && fnMD5(tfSenha.value) == usrApp.senha) {
    daoUsuario.salvarUsr(usrApp.login, usrApp.senha, usrApp.nome, usrApp.email, usrApp.celular,
      usrApp.rua, usrApp.numero, null, null, null, true);

    window.location.href = "inicio.html";
    //doGuardarUsuarioCorrente().then(retorno => {
    //  return;
    //});
  }
}

// -----------------------------------------------------------------------------------------//

function doGuardarUsuarioCorrente() {
  return fetch(
    "/guardarUsuarioCorrente/" +
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
      usrApp.rua +
      "/" +
      usrApp.numero +
      "/" +
      usrApp.complemento +
      "/" +
      usrApp.bairro +
      "/" +
      usrApp.cep,
    {
      credentials: "include"
    }
  )
    .then(response => {
      return response.json();
    })
    .catch(() => {
      return null;
    });
}

// -----------------------------------------------------------------------------------------//

async function doEfetuarLogin(login, senha) {
  if (usrApp != null && login == usrApp.login) {
    if (senha == usrApp.senha) {
      return usrApp;
    }
  }
  let response = await fetch("/login/" + login + "/" + senha, { credentials : "include" } );
  let respJson = await response.json();
  usrApp = respJson;
  return respJson;
}

// -----------------------------------------------------------------------------------------//

async function callbackOk() {
  const login = tfLogin.value;
  const senha = fnMD5(tfSenha.value);

  colocarEspera();
  // chama efetuarLogin e atualiza a tela
  let retorno = await doEfetuarLogin(login, senha);
  renderEfetuarLogin(retorno);
  retirarEspera();
}

// -----------------------------------------------------------------------------------------//

function callbackCriar() {
  if (estadoBtNovo == "Conta") 
    window.location.href = "cadusuario.html";
  else {
    // estadoBtNovo == "Login";
    labelLogin.innerHTML = "Login:";
    tfLogin.value = "";
    tfLogin.disabled = false;
    btNovo.textContent = "Nova Conta";
    estadoBtNovo = "Conta";
    divInstrucao.innerHTML =
      "<center><b>Efetue seu Login ou Crie sua Conta</b></center>";
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
tfSenha.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
    callbackOk();
  }
});

// -----------------------------------------------------------------------------------------//


