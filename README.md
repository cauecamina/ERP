# Mini ERP Professional Project

Um sistema completo de Mini ERP com arquitetura em camadas, utilizando Node.js/TypeScript no backend e React no frontend.

## Tecnologias

### Backend
- Node.js + Express
- TypeScript
- TypeORM (MySQL)
- JWT + bcrypt
- UUID

### Frontend
- React + Vite
- Tailwind CSS
- Axios
- Lucide React

## Como Rodar o Projeto

### Pré-requisitos
- Node.js instalado
- XAMPP (MySQL) rodando

### 1. Preparar o Banco de Dados
- Abra o XAMPP e inicie o MySQL.
- Acesse o `phpMyAdmin` ou utilize um cliente MySQL.
- Crie um banco de dados chamado `mini_erp`.

### 2. Configurar o Backend
- Navegue para a pasta `backend`.
- O arquivo `.env` já foi criado com as configurações padrão do XAMPP (root sem senha).
- Instale as dependências:
  ```bash
  npm install --ignore-engines
  ```
- Rode as migrations para criar as tabelas:
  ```bash
  npm run migration:run
  ```
- Inicie o servidor:
  ```bash
  npm run dev
  ```
  O servidor rodará em `http://localhost:3000`.

### 3. Configurar o Frontend
- Navegue para a pasta `frontend`.
- Instale as dependências:
  ```bash
  npm install --ignore-engines
  ```
- Inicie o projeto:
  ```bash
  npm run dev
  ```
  O projeto rodará em `http://localhost:5173`.

> [!NOTE]
> Se você ver erros de "EBADENGINE", é porque o Vite 7 requer Node.js >= 22.12.0 e você está em uma versão ligeiramente anterior (ex: 22.11.0). O comando `--ignore-engines` resolve isso com segurança.


## Testando as Rotas

### Primeiro Acesso
1. Como o banco está vazio, você precisa criar um usuário via API ou no banco.
2. Você pode usar uma ferramenta como Postman/Insomnia para testar o cadastro:
   - **POST** `http://localhost:3000/users/register`
   - Body JSON:
     ```json
     {
       "name": "Administrador",
       "email": "admin@erp.com",
       "password": "123",
       "role": "admin"
     }
     ```
3. No Frontend, faça login com o email e senha criados.

## Estrutura do Projeto
O projeto segue uma arquitetura modular e em camadas:
- **Entities**: Definição dos modelos de dados.
- **Repositories**: Interface com o banco de dados via TypeORM.
- **Services**: Lógica de negócio (cálculos, validações, transações).
- **Controllers**: Manipulação de requisições HTTP.
- **Routes**: Definição dos endpoints da API.
