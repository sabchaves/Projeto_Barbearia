const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connString = process.env.MONGODB_URI;
    
    // Check if the URI is the default template
    if (connString.includes('admin:cabeludos123@cluster0.mongodb.net')) {
      console.warn('\n==================================================================');
      console.warn('AVISO: Você está usando a string de conexão padrão do MongoDB Atlas.');
      console.warn('Para que o banco funcione, certifique-se de configurar MONGODB_URI');
      console.warn('no arquivo backend/.env com a sua própria conta do MongoDB Atlas.');
      console.warn('Se preferir rodar localmente, você pode alterar para: mongodb://localhost:27017/cabeludos');
      console.warn('==================================================================\n');
    }

    const conn = await mongoose.connect(connString, {
      serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of hanging
    });

    console.log(`MongoDB Conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Erro ao conectar ao MongoDB: ${error.message}`);
    console.warn('\n==================================================================');
    console.warn('DICA DE EXECUÇÃO: O servidor backend continuará rodando, mas as');
    console.warn('operações de banco de dados irão falhar até que o MongoDB Atlas');
    console.warn('ou MongoDB Local esteja rodando e configurado corretamente no .env.');
    console.warn('==================================================================\n');
    // We don't exit the process here so that the server can still respond with setup instructions if needed
  }
};

module.exports = connectDB;
