# API MDEZINHO-BACKEND

É necessário que o Mongodb esteja rodando ao menos no local para funcionar.

1. Git clone no repositório
2. Crie um arquivo .env na raiz copiando o .env.example, não precisa alterar as variáveis por enquanto
2. npm i && npm i --dev
3. node server.js


# RESTORE DO BACKUP

mongorestore --db mdezinho --drop dump/mdezinho/
