import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ImageBackground, StyleSheet, Alert } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('quiz.db');

const dados = [
  ["Onde fica o Brasil?", "Europa", "América do Sul", 2],
  ["Capital da França?", "Paris", "Roma", 1],
  ["2 + 2 =", "3", "4", 2],
  ["O Sol é...", "Planeta", "Estrela", 2],
  ["Maior oceano?", "Pacífico", "Atlântico", 1],
  ["Linguagem do React?", "JavaScript", "Python", 1],
  ["Animal que mia?", "Cachorro", "Gato", 2],
  ["Planeta vermelho?", "Marte", "Vênus", 1],
  ["5 x 2 =", "10", "8", 1],
  ["Cor do céu limpo?", "Azul", "Verde", 1],
  ["Capital do Brasil?", "Brasília", "Rio de Janeiro", 1],
  ["3 x 3 =", "6", "9", 2],
  ["Mamífero?", "Baleia", "Tubarão", 1],
  ["CSS serve para...", "Estilo de página", "Banco de dados", 1],
  ["Maior planeta?", "Júpiter", "Marte", 1],
  ["Rio famoso do Egito?", "Nilo", "Amazonas", 1],
  ["7 - 4 =", "3", "5", 1],
  ["Sistema operacional?", "Linux", "Google", 1],
  ["Água ferve a...", "100°C", "50°C", 1],
  ["Animal que voa?", "Galinha", "Águia", 2],
  ["Linguagem de programação?", "Java", "HTML", 1],
  ["Continente do Japão?", "Ásia", "África", 1],
  ["10 / 2 =", "3", "5", 2],
  ["Maior floresta?", "Amazônica", "Saara", 1],
  ["Navegador web?", "Chrome", "Windows", 1],
  ["Planeta mais próximo do Sol?", "Mercúrio", "Terra", 1],
  ["4 x 5 =", "20", "25", 1],
  ["Banco de dados?", "SQLite", "React", 1],
  ["Cor do sangue?", "Vermelho", "Azul", 1],
  ["Lua é um...", "Satélite", "Planeta", 1]
];

export default function App() {
  const [perguntas, setPerguntas] = useState([]);
  const [perguntasJogo, setPerguntasJogo] = useState([]);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [fase, setFase] = useState('inicio'); // inicio | jogando | fim

  useEffect(() => {
    inicializarBanco();
  }, []);

  async function inicializarBanco() {
    try {
      await criarTabela();
      await inserirDadosIniciais();
      await carregarPerguntas();
    } catch (error) {
      console.log('Erro ao inicializar banco:', error);
    }
  }

  async function criarTabela() {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS perguntas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pergunta TEXT,
        resposta1 TEXT,
        resposta2 TEXT,
        correta INTEGER
      );
    `);

    console.log('Tabela criada/verificada com sucesso.');
  }

  async function inserirDadosIniciais() {
    const result = await db.getAllAsync('SELECT * FROM perguntas;');

    if (result.length === 0) {
      console.log('Tabela vazia. Inserindo dados iniciais...');

      for (const item of dados) {
        await db.runAsync(
          'INSERT INTO perguntas (pergunta, resposta1, resposta2, correta) VALUES (?, ?, ?, ?);',
          item
        );
      }

      console.log('Dados iniciais inseridos com sucesso.');
    } else {
      console.log('Tabela já possui dados. Não será reinserido.');
    }
  }

  async function carregarPerguntas() {
    const result = await db.getAllAsync('SELECT * FROM perguntas ORDER BY id;');
    setPerguntas(result);
    console.log('Perguntas carregadas:', result.length);
  }

  function embaralharArray(array) {
    const copia = [...array];

    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copia[i], copia[j]] = [copia[j], copia[i]];
    }

    return copia;
  }

  function iniciarJogo() {
    const embaralhadas = embaralharArray(perguntas);
    const selecionadas = embaralhadas.slice(0, 10);

    setPerguntasJogo(selecionadas);
    setIndiceAtual(0);
    setAcertos(0);
    setFase('jogando');

    setTimeout(() => {
      mostrarPerguntaAtual(selecionadas, 0, 0);
    }, 200);
  }

  function mostrarPerguntaAtual(lista = perguntasJogo, indice = indiceAtual, totalAcertos = acertos) {
    const perguntaAtual = lista[indice];

    if (!perguntaAtual) {
      setAcertos(totalAcertos);
      setFase('fim');
      return;
    }

    Alert.alert(
      'Pergunta',
      perguntaAtual.pergunta,
      [
        {
          text: perguntaAtual.resposta1,
          onPress: () => responder(1, perguntaAtual, lista, indice, totalAcertos)
        },
        {
          text: perguntaAtual.resposta2,
          onPress: () => responder(2, perguntaAtual, lista, indice, totalAcertos)
        }
      ],
      { cancelable: false }
    );
  }

  function responder(opcaoEscolhida, perguntaAtual, lista, indice, totalAcertos) {
    let novosAcertos = totalAcertos;

    if (opcaoEscolhida === perguntaAtual.correta) {
      novosAcertos = totalAcertos + 1;
    }

    const proximoIndice = indice + 1;

    if (proximoIndice < lista.length) {
      setIndiceAtual(proximoIndice);
      setAcertos(novosAcertos);

      setTimeout(() => {
        mostrarPerguntaAtual(lista, proximoIndice, novosAcertos);
      }, 150);
    } else {
      setAcertos(novosAcertos);
      setFase('fim');
    }
  }

  function reiniciarJogo() {
    setPerguntasJogo([]);
    setIndiceAtual(0);
    setAcertos(0);
    setFase('inicio');
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ImageBackground
          source={require('./assets/imagem.png')}
          style={styles.background}
          resizeMode="cover"
        >
          <View style={styles.overlay}>
            {fase === 'inicio' && (
              <View style={styles.card}>
                <Text style={styles.titulo}>Quiz de Perguntas</Text>
                <Text style={styles.subtitulo}>
                  Perguntas carregadas no banco: {perguntas.length}
                </Text>

                <Pressable style={styles.botao} onPress={iniciarJogo}>
                  <Text style={styles.botaoTexto}>Iniciar</Text>
                </Pressable>
              </View>
            )}

            {fase === 'jogando' && (
              <View style={styles.card}>
                <Text style={styles.titulo}>Quiz em andamento...</Text>
                <Text style={styles.subtitulo}>
                  Pergunta {indiceAtual + 1} de {perguntasJogo.length}
                </Text>
                <Text style={styles.subtitulo}>
                  Acertos até agora: {acertos}
                </Text>
              </View>
            )}

            {fase === 'fim' && (
              <View style={styles.card}>
                <Text style={styles.titulo}>Fim</Text>
                <Text style={styles.subtitulo}>
                  Você acertou {acertos} de {perguntasJogo.length}
                </Text>

                <Pressable style={styles.botao} onPress={reiniciarJogo}>
                  <Text style={styles.botaoTexto}>Reiniciar</Text>
                </Pressable>
              </View>
            )}
          </View>
        </ImageBackground>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000'
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%'
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  card: {
    width: '85%',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 12,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center'
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#222'
  },
  subtitulo: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333'
  },
  botao: {
    backgroundColor: '#1976D2',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 8,
    elevation: 3
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  }
});