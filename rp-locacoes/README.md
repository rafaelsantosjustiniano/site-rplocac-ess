# RP Locações — Site

Site estático em **HTML + CSS + JavaScript puro**. Não precisa de build, Node ou banco de dados.

## Como abrir
- Dê dois cliques em `index.html`, **ou**
- No VS Code, use a extensão **Live Server** (recomendado: o carrinho salvo no `localStorage` fica 100% consistente entre as páginas).

Para publicar, envie a pasta inteira para qualquer hospedagem estática (Netlify, Vercel, GitHub Pages, Hostinger…).

## Estrutura
```
index.html          Início (hero, promoção, tipos de evento)
catalogo.html       Catálogo com filtros, busca e seletor de quantidade
calculadora.html    Calculadora de eventos (sugestão automática de kits)
como-funciona.html  Passo a passo, área de atendimento, pagamento e FAQ
carrinho.html       Pedido + dados do evento + envio pelo WhatsApp
css/style.css       Estilos (cores em :root, no topo do arquivo)
js/products.js      ✏️ Produtos, preços, WhatsApp, regras e parâmetros da calculadora
js/cart.js          Carrinho (localStorage), contador, gaveta, toasts, barra mobile, ícones
js/app.js           Interações de cada página e geração da mensagem do WhatsApp
img/produtos/       Coloque aqui as fotos reais (veja LEIA-ME.txt)
```

## Edições comuns
- **Preço / descrição / novo produto:** `js/products.js` → `RP_PRODUCTS`.
- **Foto real:** salve em `img/produtos/` e preencha `image: 'img/produtos/arquivo.jpg'` no produto.
- **Número do WhatsApp:** `js/products.js` → `RP_CONFIG.whatsappNumber` e `whatsappDisplay`
  (o número também aparece escrito no rodapé de cada página HTML).
- **Mínimo da promoção:** `RP_CONFIG.promo.minQty`.
- **Lógica da calculadora:** `RP_CALC` (pessoas por jogo, % sentados, tampões por convidados).
- **Cabeçalho/rodapé:** são iguais em todas as páginas; ao alterar um, replique nos 5 arquivos `.html`.
