import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  Modal,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';

const App = () => {
  const [nomeDeUsuario, setNomeDeUsuario] = React.useState('');
  const [senha, setSenha] = React.useState('');
  const [confirmarSenha, setConfirmarSenha] = React.useState('');
  const [mensagemDeErro, setMensagemDeErro] = React.useState('');
  const [estaLogado, setEstaLogado] = React.useState(false);
  const [estaoSeRegistrando, setEstaoSeRegistrando] = React.useState(false);
  const [livros, setLivros] = React.useState([]); 
  const [novaTarefa, setNovaTarefa] = React.useState(''); 
  const [modalVisible, setModalVisible] = React.useState(false);

  const verificarSessao = React.useCallback(async () => {
    try {
      const usuarioSalvo = await AsyncStorage.getItem('usuarioLogado');
      if (usuarioSalvo) {
        setNomeDeUsuario(usuarioSalvo);
        setEstaLogado(true);
        carregarLivros(usuarioSalvo);
      }
    } catch (erro) {
      setMensagemDeErro('Erro: ' + erro);
    }
  }, []);

  const carregarLivros = async (usuario) => {
    try {
      const livrosString = await AsyncStorage.getItem(`livros_${usuario}`);
      const livrosSalvos = livrosString ? JSON.parse(livrosString) : [];
      setLivros(livrosSalvos);
    } catch (erro) {
      setMensagemDeErro('Erro ao carregar livros: ' + erro);
    }
  };

  React.useEffect(() => {
    verificarSessao();
  }, [verificarSessao]);

  const lidarComLogin = async () => {
    try {
      const usuariosString = await AsyncStorage.getItem('usuarios');
      const usuarios = usuariosString ? JSON.parse(usuariosString) : {};

      if (usuarios[nomeDeUsuario] && usuarios[nomeDeUsuario] === senha) {
        await AsyncStorage.setItem('usuarioLogado', nomeDeUsuario);
        setEstaLogado(true);
        carregarLivros(nomeDeUsuario);
      } else {
        setMensagemDeErro('Nome de usuário ou senha inválidos');
      }
    } catch (erro) {
      setMensagemDeErro('Erro: ' + erro);
    }
  };

  const lidarComRegistro = async () => {
    if (senha === confirmarSenha) {
      try {
        const usuariosString = await AsyncStorage.getItem('usuarios');
        const usuarios = usuariosString ? JSON.parse(usuariosString) : {};

        if (usuarios[nomeDeUsuario]) {
          setMensagemDeErro('Nome de usuário já existe');
        } else {
          usuarios[nomeDeUsuario] = senha;
          await AsyncStorage.setItem('usuarios', JSON.stringify(usuarios));
          await AsyncStorage.setItem('usuarioLogado', nomeDeUsuario);
          setEstaLogado(true);
        }
      } catch (erro) {
        setMensagemDeErro('Erro: ' + erro);
      }
    } else {
      setMensagemDeErro('Senhas não coincidem');
    }
  };

  const lidarComLogout = async () => {
    try {
      await AsyncStorage.removeItem('usuarioLogado');
      setEstaLogado(false);
      setLivros([]); 
    } catch (erro) {
      setMensagemDeErro('Erro: ' + erro);
    }
  };

  const adicionarLivro = async () => {
    if (novaTarefa.trim()) { 
      const novosLivros = [...livros, novaTarefa]; 
      setLivros(novosLivros);
      setNovaTarefa(''); 
      setModalVisible(false);
      try {
        await AsyncStorage.setItem(`livros_${nomeDeUsuario}`, JSON.stringify(novosLivros)); 
      } catch (erro) {
        setMensagemDeErro('Erro ao adicionar livro: ' + erro); 
      }
    }
  };

  const removerLivro = async (livro) => { 
    const novosLivros = livros.filter(item => item !== livro); 
    setLivros(novosLivros);
    try {
      await AsyncStorage.setItem(`livros_${nomeDeUsuario}`, JSON.stringify(novosLivros)); 
    } catch (erro) {
      setMensagemDeErro('Erro ao remover livro: ' + erro); 
    }
  };

  const renderHeader = () => {
    return (
      <View style={estilos.header}>
        <View style={estilos.usuarioInfo}>
          <Image style={estilos.fotoPerfil}
            source={require('./IMAGEM/1.jpg')}/>
          <Text style={estilos.nomeUsuario}>{nomeDeUsuario}</Text>
        </View>
      </View>
    );
  };

  return (
    <NavigationContainer>
      <View style={estilos.externo}>
        <View style={estaLogado ? estilos.containerLogado : estilos.container}>
          {!estaLogado && (
            <Text style={estilos.titulo}>Bem-vindo a LumiBook</Text>
          )}
          {estaLogado && renderHeader()}

          {estaLogado ? (
            <View style={estilos.containerTitulo}>
              <Text style={estilos.tituloLista}> Livros Lidos </Text>
              <FlatList
                data={livros} 
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <View style={estilos.itemTarefa}>
                    <Text style={estilos.textoTarefa}>{item}</Text>
                    <TouchableOpacity onPress={() => removerLivro(item)}> 
                      <Text style={estilos.removerTarefa}>X</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
              <Image
                style={estilos.imagem3}
                source={require('./IMAGEM/3.jpg')}
              />
            </View>
          ) : estaoSeRegistrando ? (
            <View style={estilos.formulario}>
              <Image
                style={estilos.imagem}
                source={require('./IMAGEM/2.jpg')}
              />
              <TextInput
                style={estilos.input}
                placeholder="Nome de usuário"
                value={nomeDeUsuario}
                onChangeText={setNomeDeUsuario}
              />
              <TextInput
                style={estilos.input}
                placeholder="Senha"
                value={senha}
                secureTextEntry
                onChangeText={setSenha}
              />
              <TextInput
                style={estilos.input}
                placeholder="Confirmar Senha"
                value={confirmarSenha}
                secureTextEntry
                onChangeText={setConfirmarSenha}
              />
              <TouchableOpacity
                style={estilos.botaoRegistrar}
                onPress={lidarComRegistro}>
                <Text style={estilos.textoBotao}>Registrar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEstaoSeRegistrando(false)}>
                <Text style={estilos.textoAlternar}>
                  Já possui conta? Faça login!
                </Text>
              </TouchableOpacity>
              {mensagemDeErro ? (
                <Text style={estilos.erro}>{mensagemDeErro}</Text>
              ) : null}
            </View>
          ) : (
            <View style={estilos.formulario}>
              <Image
                style={estilos.imagem}
                source={require('./IMAGEM/1.jpg')}
              />
              <TextInput
                style={estilos.input}
                placeholder="Nome de usuário"
                value={nomeDeUsuario}
                onChangeText={setNomeDeUsuario}
              />
              <TextInput
                style={estilos.input}
                placeholder="Senha"
                value={senha}
                secureTextEntry
                onChangeText={setSenha}
              />
              <TouchableOpacity
                style={estilos.botaoLogin}
                onPress={lidarComLogin}>
                <Text style={estilos.textoBotao}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEstaoSeRegistrando(true)}>
                <Text style={estilos.textoAlternar}>
                  Não possui conta? Cadastre-se!
                </Text>
              </TouchableOpacity>
              {mensagemDeErro ? (
                <Text style={estilos.erro}>{mensagemDeErro}</Text>
              ) : null}
            </View>
          )}
        </View>
        <Modal
          animationType="slide"
          transparent={false}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}>
          <View style={estilos.modalContainer}>
            <Text style={estilos.modalTitulo}>Adicionar Novo Livro</Text>
            <TextInput
              style={estilos.input}
              placeholder="Novo livro"
              value={novaTarefa} 
              onChangeText={setNovaTarefa} 
            />
            <TouchableOpacity style={estilos.botaoRegistrar} onPress={adicionarLivro}>
              <Text style={estilos.textoBotao}>Adicionar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={estilos.textoAlternar}>Fechar</Text>
            </TouchableOpacity>
            <Image style={estilos.imagem}
            source={require('./IMAGEM/5.jpg')}/>

          </View>
        </Modal>

        {estaLogado && (
          <View style={estilos.navBar}>
            <TouchableOpacity style={estilos.botaoNav} onPress={() => setModalVisible(true)}>
              <Text style={estilos.textoBotaoNav}>Adicionar Livro</Text> 
            </TouchableOpacity>
            <TouchableOpacity style={estilos.botaoNav} onPress={lidarComLogout}>
              <Text style={estilos.textoBotaoNav}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </NavigationContainer>
  );
};

const estilos = StyleSheet.create({
  externo: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    width: '90%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  containerLogado: {
    flex: 1,
    width: '100%',
    backgroundColor: '#FFC0CB',
    padding: 20,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  usuarioInfo: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  fotoPerfil: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  nomeUsuario: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  formulario: {
    width: '100%',
    alignItems: 'center',
  },
  imagem: {
    width: 256,
    height: 200,
    marginBottom: 20,
  },
  imagem3: {
    width: 270,
    height: 200,
  },
  input: {
    height: 50,
    borderColor: '#FFC0CB',
    color: 'black',
    borderWidth: 2,
    marginBottom: 10,
    padding: 10,
    width: '80%',
    borderRadius: 10,
  },
  botaoLogin: {
    width: '70%',
    paddingVertical: 10,
    backgroundColor: '#FFC0CB',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 15,
  },
  botaoRegistrar: {
    width: '70%',
    paddingVertical: 10,
    backgroundColor: '#FFC0CB',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 15,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#FFC0CB',
    width: '100%',
  },
  botaoNav: {
    padding: 10,
  },
  textoBotaoNav: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  textoBotao: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  textoAlternar: {
    color: 'black',
    marginTop: 10,
  },
  erro: {
    color: '#ff5252',
    marginTop: 10,
  },
  titulo: {
    fontSize: 32,
    textAlign: 'center',
    marginVertical: 20,
    color: 'black',
  },
  containerTitulo: {
    backgroundColor: 'white', 
    padding: 15,
    flex: 1,
    justifyContent: 'flex-start',
    width: '100%',
    alignItems: 'center',
    borderRadius: 10,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  tituloLista: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
    color: 'black', 
    textAlign: 'center', 
    width: '100%',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  modalTitulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  itemTarefa: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 5,
    backgroundColor: 'white',
    width: '100%',
  },
  textoTarefa: {
    fontSize: 18,
  },
  removerTarefa: {
    color: '#ff5252',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default App;