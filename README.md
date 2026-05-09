# Redator AI - Portal de Notícias 📰

Uma ferramenta jornalística inteligente que transforma fatos em notícias profissionais usando IA (Google Gemini).

## 🎯 Objetivo

Automatizar a geração de artigos jornalísticos de qualidade a partir de informações brutas, facilitando o trabalho de redatores e jornalistas.

---

## 🚀 Funcionalidades

- ✅ **Geração de Notícias com IA**: Transforma fatos em artigos profissionais e estruturados
- ✅ **Múltiplas Categorias**: Brasil, Mundo, Política, Economia, Tecnologia, Esporte, Entretenimento
- ✅ **Anexação de Arquivos**: Suporte para PDFs e imagens como referência
- ✅ **Histórico de Notícias**: Salve e gerencie notícias geradas
- ✅ **Edição em Tempo Real**: Modifique manchetes e conteúdo
- ✅ **Segurança**: Backend protegido com chave API segura

---

## 🔧 Tech Stack

### Frontend
- **React 19** - Interface moderna e reativa
- **TypeScript** - Type safety
- **Vite** - Build tool ultra-rápido
- **Tailwind CSS** - Estilização
- **Lucide React** - Ícones

### Backend
- **Node.js + Express** - Servidor seguro
- **Google Generative AI (Gemini)** - IA para geração de conteúdo
- **CORS** - Cross-origin requests
- **dotenv** - Gerenciamento de variáveis de ambiente

---

## 📋 Problemas Encontrados Durante Desenvolvimento

### 1. **Script de Entrada Ausente no HTML** ❌
**Problema**: O `index.html` não carregava o arquivo `index.tsx`, resultando em página em branco.

**Solução**: 
```html
<script type="module" src="/index.tsx"></script>
```
Adicionado ao `index.html` para montar a aplicação React.

---

### 2. **Ordem Incorreta de Scripts** ⚠️
**Problema**: O `<script type="importmap">` estava DEPOIS do `<script type="module">`, causando erro do Vite.

**Erro**:
```
(!) <script type="importmap"> should come before <script type="module"> 
and <link rel="modulepreload"> in /index.html
```

**Solução**: Reordenado no `index.html`:
```html
<!-- CORRETO: importmap ANTES de module -->
<script type="importmap">{ ... }</script>
<script type="module" src="/index.tsx"></script>
```

---

### 3. **Chave API Exposta no Frontend** 🔓
**Problema**: A chave API do Google Gemini estava no `.env.local` e era carregada pelo Vite no bundle, expondo-a no navegador.

```typescript
// ❌ INSEGURO: Chave visível no navegador
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
```

**Risco**: Qualquer pessoa poderia usar a chave, causando custos inesperados.

**Solução**: 
- Criado **backend Express seguro** na porta 5000
- Chave API fica **apenas no servidor**
- Frontend faz **requisições HTTP** para o backend
- Chave nunca é exposta ao navegador

```typescript
// ✅ SEGURO: Chave no servidor apenas
const response = await fetch('http://localhost:5000/api/generate-news', {
  method: 'POST',
  body: JSON.stringify({ category, facts, files })
});
```

---

### 4. **Chave API Inválida ou Não Autorizada** 🔑
**Problema**: Requisições à API Gemini retornavam erro 400:
```
API key not valid. Please pass a valid API key.
```

**Causas Investigadas**:
1. Chave não era para Gemini API
2. Restrições aplicadas à chave
3. API não estava ativada no projeto Google Cloud

**Solução**:
1. Usar Google AI Studio: https://aistudio.google.com/app/apikey
2. Criar chave para Gemini API especificamente
3. Restringir a chave apenas à API Gemini (após 19 de junho de 2026)

---

### 5. **Modelo API Descontinuado** 🚫
**Problema**: Tentativas com modelos como `gemini-1.5-flash` e `gemini-pro` retornavam 404.

```
models/gemini-1.5-flash is not found for API version v1beta
```

**Solução**: Usar modelo suportado: `gemini-2.5-flash`

---

## 🛠️ Instalação e Uso

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Chave API do Google Gemini

### 1. Clone o Repositório
```bash
git clone https://github.com/Jbrr2021/Redaro-AI.git
cd Redaro-AI
```

### 2. Instale as Dependências
```bash
npm install
```

### 3. Configure a Chave API
Crie um arquivo `.env.local` na raiz do projeto:
```env
GEMINI_API_KEY=sua_chave_aqui
```

**Como obter a chave**:
1. Acesse https://aistudio.google.com/app/apikey
2. Clique em "Create API Key"
3. Copie a chave gerada
4. Cole em `.env.local`

### 4. Execute o Projeto

**Opção A**: Ambos simultaneamente
```bash
npm run dev:full
```

**Opção B**: Em terminais separados
```bash
# Terminal 1: Backend
npm run dev:backend

# Terminal 2: Frontend
npm run dev
```

### 5. Acesse
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

---

## 📁 Estrutura do Projeto

```
redaro-ai/
├── src/
│   ├── App.tsx              # Componente principal
│   ├── index.tsx            # Entry point React
│   ├── types.ts             # TypeScript types
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── NewsForm.tsx
│   │   ├── NewsDisplay.tsx
│   │   ├── FilesPage.tsx
│   │   └── HistoryPage.tsx
│   └── services/
│       ├── geminiService.ts # Chamadas ao backend
│       └── storageService.ts# LocalStorage
├── server.js                # Backend Express (NOVO)
├── index.html              # HTML (CORRIGIDO)
├── vite.config.ts
├── package.json            # (ATUALIZADO)
└── .env.local             # Variáveis de ambiente
```

---

## 🔐 Arquitetura de Segurança

### Antes (Inseguro)
```
[Frontend] ---> [Google Gemini API]
   ↑
  chave exposa no bundle
```

### Depois (Seguro)
```
[Frontend] ---> [Backend Express] ---> [Google Gemini API]
                (chave protegida)
```

**Benefícios**:
- ✅ Chave API nunca é exposta ao cliente
- ✅ Possibilidade de adicionar autenticação
- ✅ Rate limiting no servidor
- ✅ Logs de auditoria
- ✅ Escalável para múltiplos usuários

---

## 📝 Endpoints da API

### `GET /api/health`
Verifica se o backend está ativo.
```bash
curl http://localhost:5000/api/health
```

### `POST /api/generate-news`
Gera uma notícia com base nos fatos fornecidos.

**Requisição**:
```json
{
  "category": "Brasil",
  "facts": "O governo anunciou um novo pacote de infraestrutura...",
  "files": []
}
```

**Resposta**:
```json
{
  "success": true,
  "news": {
    "manchete": "Governo anuncia R$ 50 bilhões...",
    "subtitulo": "Investimento focará em rodovias e ferrovias",
    "lead": "O governo federal...",
    "corpo": ["Parágrafo 1...", "Parágrafo 2..."],
    "contexto": "Este é um contexto histórico...",
    "desdobramento": "Espera-se que..."
  }
}
```

### `POST /api/optimize-headline`
Otimiza uma manchete existente para SEO.

**Requisição**:
```json
{
  "currentHeadline": "Governo anuncia investimentos",
  "subtitle": "Foco em infraestrutura",
  "lead": "O governo anunciou...",
  "category": "Economia"
}
```

---

## 🐛 Troubleshooting

### "Chave API inválida"
- Verifique se a chave está em `.env.local`
- Confirme que é uma chave Gemini (não Google Maps ou outra)
- Teste a chave em: https://aistudio.google.com/app/apikey

### "Backend não responde"
- Verifique se a porta 5000 está disponível
- Execute: `npm run dev:backend`
- Teste: `curl http://localhost:5000/api/health`

### "Frontend em branco"
- Recarregue a página (`F5`)
- Abra o console (`F12`) para ver erros
- Verifique se Vite está rodando: `npm run dev`

---

## 📚 Aprendizados Principais

1. **Segurança em Primeiro Lugar**: Nunca exponha chaves de API no cliente
2. **Ordem de Scripts Importa**: Importmap deve vir antes de módulos
3. **Documentação é Essencial**: Erros são mais fáceis de resolver com logs claros
4. **Testes Early**: Validar a API desde o início economiza horas

---

## 📄 Licença

Este projeto é privado. Consulte com o proprietário para uso.

---

## 👨‍💻 Autor

Desenvolvido como solução jornalística moderna com IA.

---

## 🚀 Próximas Melhorias

- [ ] Autenticação de usuários
- [ ] Dashboard de estatísticas
- [ ] Integração com CMS (WordPress, etc)
- [ ] Rate limiting e quotas
- [ ] Publicação direta em redes sociais
- [ ] Suporte a múltiplos idiomas
- [ ] Testes automatizados
- [ ] Deploy em produção (Docker + CI/CD)

---

**Última atualização**: 8 de maio de 2026
