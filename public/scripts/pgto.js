"use strict";

//-----------------------------------------------------------------------------------------//

var instalando = false;
var requestDB = null;
var db = null;
var store = null;
var transacao = null;
var usr = null;

const divConteudo = document.getElementById("divConteudo");
const divInstrucao = document.getElementById("divInstrucao");
const tfNomeCartao = document.getElementById("tfNomeCartao");
const tfNumCartao = document.getElementById("tfNumCartao");
const tfMesValidade = document.getElementById("tfMesValidade");
const tfAnoValidade = document.getElementById("tfAnoValidade");
const tfCVV = document.getElementById("tfCvv");
const btCriar = document.getElementById("btOk");
const btCancelar = document.getElementById("btCancelar");

var nomeCartao;
var numCartao;
var mesValidade;
var anoValidade;
var cvv;

$(document).ready(function() {
  tirarEspera();
  $("#tfNumCartao").mask("9999.9999.9999.9999");
  $("#tfMesValidade").mask("99");
  $("#tfAnoValidade").mask("9999");
  $("#tfCvv").mask("999");
});

//-----------------------------------------------------------------------------------------//

function validarAno(strAno) {
  var ano;

  ano = parseInt(strAno);
  if(ano < 2020)
    return false;
  return true;
}

//-----------------------------------------------------------------------------------------//

function doProcessarPgtoCredito() {
  console.log("(pgto.js) Executando Pgto Crédito" );
  return fetch(
    "/pagarCredito/" +
      cpf.replace(/\.|-/g, "") +
      "/" +
      nome +
      "/" +
      funcaoMD5(senha) +
      "/" +
      email +
      "/" +
      celular.replace(/\(|\)|\s|-/g, "") +
      "/" +
      endereco
  )
    .then(response => {
      console.log("(cadusuario.js) incluirPaciente response");
      return response.json();
    })
    .catch(() => {
      console.log("(cadusuario.js) incluirPaciente catch");
      return null;
    });
}

//-----------------------------------------------------------------------------------------//

function doGuardarUsuarioCorrente() {
  console.log("(cadusuario.js) Executando Guardar Usuário Corrente " + cpf);
  return fetch(
    "/guardarUsuarioCorrente/" +
      cpf +
      "/" +
      funcaoMD5(senha) +
      "/" +
      nome +
      "/" +
      email +
      "/" +
      celular +
      "/" +
      endereco
  )
    .then(response => {
      console.log("(cadusuario.js) doGuardarUsuarioCorrente response");
      return response.json();
    })
    .catch(() => {
      console.log("(cadusuario.js) doGuardarUsuarioCorrente catch");
      return null;
    });
}

//-----------------------------------------------------------------------------------------//

function callbackCancelar() {
  var tamHistory = window.history.length;
  while (tamHistory > 0) {
    window.history.go(-1);
    tamHistory--;
  }
}

//-----------------------------------------------------------------------------------------//

function callbackOk() {
  console.log("(cadusuario.js) callbackCriar");
  // Verificando o Nome
  nomeCartao = tfNomeCartao.value;
  if (nomeCartao == null || nomeCartao == "") {
    alert("O nome no cartão deve ser preenchido.");
    return;
  }
  numCartao = tfNumCartao.value;
  if (numCartao == null || numCartao == "") {
    alert("O número do cartão deve ser preenchido.");
    return;
  }
  // Verificando o mês de validade
  mesValidade = tfMesValidade.value;
  if (mesValidade  == null || mesValidade  == "") {
    alert("O Mês de Validade  deve ser preenchido.");
    return;
  }
  // Verificando o email
  email = tfEmail.value;
  if (email == null || email == "") {
    alert("O email deve ser preenchido.");
    return;
  }
  const padrao = /[a-zA-Z0-9._%-]+@[a-zA-Z0-9-]+.[a-zA-Z]{2,4}/;
  if (!padrao.test(email)) {
    alert("O email é inválido.");
    return;
  }
  // Verificando a senha
  senha = tfSenha.value;
  if (senha == null || senha == "") {
    alert("A senha deve ser preenchida.");
    return;
  }
  if (senha.length < 6) {
    alert("A senha deve pelo menos 6 caracteres.");
    return;
  }
  // Verificando o replay da senha
  replay = tfReplay.value;
  if (replay == null || replay == "") {
    alert("A repetição da senha deve ser preenchida.");
    return;
  }
  if (senha != replay) {
    alert("A repetição da senha está divergente da senha informada.");
    return;
  }

  // Verificando o endereço
  endereco = tfEndereco.value;
  if (endereco == null || endereco == "") {
    alert("O endereço deve ser preenchido.");
    return;
  }

  colocarEspera();

  // Solicita ao server.js para que execute o WS para inclusão de paciente
  doIncluirPaciente().then(retorno => {
    console.log("(cadusuario.js) callbackCriar retorno", retorno);
    if (retorno.hasOwnProperty("status")) {
      if (retorno.status == "success") {
        // Guarda os dados no banco local
        abrirDbApp();
        // Solicita ao server.js para guardar os dados do usuário
        doGuardarUsuarioCorrente().then(retorno => {
          console.log("(cadusuario.js) callbackCriar retorno", retorno);
          renderCriarUsuario(retorno);
        });
      } else alert(retorno.msg);
    } else alert(retorno.erro);
    tirarEspera();
  });
}

//-----------------------------------------------------------------------------------------//

function colocarEspera() {
  $("div.circle").addClass("wait");
}

// -----------------------------------------------------------------------------------------//

function tirarEspera() {
  $("div.circle").removeClass("wait");
}

// -----------------------------------------------------------------------------------------//btCancelar.addEventListener("click", callbackCancelar);
btCriar.addEventListener("click", callbackCriar);
btCancelar.addEventListener("click", callbackCancelar);

tfCpf.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
    tfNome.focus();
  }
});
tfNome.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
    tfCelular.focus();
  }
});
tfCelular.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
    tfEmail.focus();
  }
});
tfEmail.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
    tfEndereco.focus();
  }
});
tfEmail.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
    tfSenha.focus();
  }
});
tfSenha.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
    tfReplay.focus();
  }
});
tfReplay.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
    callbackCriar();
  }
});
