# Audience Collector Puppeteer
<!-- [START badges] -->
 Com esse projeto é possível coletar a população de diversas audiências de forma automática. A automação gera um arquivo em formato xlsx contendo informações de população, nome da audiência, id da audiência e dia atual.

## Como executar


### Instalação
Para iniciar a utilização da aplicação é necessário seguir as seguintes etapas de instalação:

```
$ npm install

$ npm i puppeteer

$ npm install xlsx
```

### Ajuste no código

1- É necessário adequar o código para suas necessidades. No arquivo *index.js* ajuste:

1.1- Adicione seu email e senha do login Adobe.

```
// adicione seu email e senha do login adobe
userLogin: 'user login',
userPassword: 'user password'
```
1.2- Adicione as URLs das audiências que deseja acompanhar a evolução das populações.
```
async function main() {
  await crawler('audience url');
  /* add new urls bellow:
  await crawler('other urls')
  .
  .
  .
  */
  await writeFiles();
}
```
### Para executar a aplicação
```
node index.js
```