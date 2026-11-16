# Leitura de ISBN pela câmera — proposta para validação

A proposta se inspira na interação descrita pela proprietária: visualizar a câmera com uma linha central para ajudar a alinhar o código de barras. A [central de ajuda do Skoob](https://ajuda.skoob.com.br/hc/pt-br/articles/39620528274843-Para-que-serve-o-leitor-de-c%C3%B3digos-de-barras-e-como-posso-utiliz%C3%A1-lo) orienta apontar a câmera para o código na contracapa. Não foi localizada uma imagem confiável da tela atual para confirmar seus detalhes visuais.

## Fluxo proposto

1. No cadastro, tocar em **Ler código pela câmera**. A permissão só é solicitada nessa ação.
2. Exibir uma área maior com a imagem da câmera, orientação e uma linha horizontal central. A linha é apenas uma guia visual; a leitura continua automática.
3. Ao reconhecer um ISBN válido, encerrar a câmera, preencher o ISBN e iniciar a consulta já existente.
4. Oferecer **Parar câmera** e manter a digitação de ISBN no formulário. Se a câmera for negada ou indisponível, informar o problema e manter a alternativa manual.

## Esquema para celular

```text
┌──────────────────────────────┐
│ Ler código pela câmera       │
│                              │
│ Aponte para o código de      │
│ barras na contracapa.        │
│                              │
│ ┌──────────────────────────┐ │
│ │                          │ │
│ │       imagem ao vivo     │ │
│ │ ───── linha central ──── │ │
│ │                          │ │
│ └──────────────────────────┘ │
│                              │
│      [ Parar câmera ]        │
│                              │
│ Ou digite o ISBN no campo.   │
└──────────────────────────────┘
```

No computador, a área de câmera permanece proporcional e limitada ao espaço do painel. A linha usa a cor de destaque aprovada no manual visual; moldura e mensagens usam as paletas existentes. A linha e a moldura são decorativas para leitores de tela, pois a instrução também é apresentada em texto. Não depender de animação para orientar a leitura.

## Validação pendente

O esquema é uma proposta e não confirma que o leitor do Skoob tenha a mesma aparência. A proprietária aprovou a organização. O [protótipo visual](PROTOTIPO-CAMERA.html) aguarda validação antes da implementação. Testar no celular, com câmera permitida, negada e indisponível, dependerá de autorização para acesso ao dispositivo ou de teste pela proprietária.
