# Burndown4Trello
##### Sistema gerador de Burndowns a partir do Trello.
#### Tecnologias utilizadas:
* [Node.js] - Desenvolvimento back-end com JS;
* [Git] - Ferramenta de controle de versão;
* [jQuery] - Nosso velho companheiro de Front-end;
* [Bootstrap] - Framework para desenvolvimento front-end;
* [Express] - Framework Node.js;
* [HighCharts] - Biblioteca JS para gerar gráficos interativos dinamicamente.

#### Pré-requisitos:
* [Node.js] - Desenvolvimento back-end com JS;
* [Git] - Ferramenta de controle de versão;

[Node.js]: <http://nodejs.org>
[Express]: <http://expressjs.com>
[jQuery]: <http://jquery.com>
[Bootstrap]: <http://getbootstrap.com/>
[Git]: <https://git-scm.com/>
[HighCharts]: <http://www.highcharts.com/>

# 1. Instalação

Para clonar o projeto, abra no cmd o diretório que irá armazenar o projeto, e execute os comandos
```sh
$ git clone https://github.com/wildeee/Burndown4Trello.git
$ cd Burndown4Trello
$ npm install
$ node app.js
```
Feito isso, o sistema estará rodando em http://localhost:3000/. Caso queira abrir o sistema sem precisar deixar o prompt aberto, execute o comando:
```sh
$ npm install -g forever
$ exit
```
E execute o arquivo "Iniciar Burndown.bat".

# 2. Configuração
O sistema não utiliza qualquer banco de dados, portanto, as informações sobre as configurações ficam em arquivos JSON. Tais arquivos estão presentes na pasta /Public, são os **global-config.json** e **burndowns.json**, que são, respectivamente as configurações pertencentes a todo o sistema, e as pertencentes a cada burndown que vai ser gerado.

## 2.1 Configurações do global-config.json
Esse é o nosso arquivo de configurações globais do sistema, que valerão para todos os burndowns gerados. Sua estrutura contém os campos: 
##### 2.1.1 Campos de customização de cor:
São os campos de cor hexadecimal para customização. O sugerido são os seguintes: "cor_de_fundo_do_titulo": "000066", "cor_de_fundo_da_tela": "FFFFFF", "cor_fonte": "FFFFFF"
##### 2.1.2 key_trello:
Para obter essa key, esteja logado no Trello e acesse essa url: https://trello.com/app-key. Copie o campo "Key" para o conteúdo desse campo. **Atenção:** A key gerada deve ser de um usuário que tenha acesso a **todos** os boards dos quais serão gerador burndown, caso contrário, a API do Trello não nos fornecerá informação alguma.
##### 2.1.3 token_trello:
Para obter seu token, acesse a URL https://trello.com/1/authorize?key=SUBSTITUTE_WITH_YOUR_KEY&name=Burndown4Trello&expiration=never&response_type=token substituindo a parte "SUBSTITUTE_WITH_YOUR_KEY" dessa URL pela sua Key, obtida no passo anterior. Após obter o token, copie e cole-o no conteúdo desse campo no nosso arquivo de configuração.
##### 2.1.4 nome_eixo_y:
Esse campo se trata do nome da unidade de medida a qual o burndown faz seus cálculos. Foi colocada aqui pois alguns projetos utilizam pontos de função em seu burndown, enquanto outros usam horas, portanto, informe isso no conteúdo do campo.


## 2.2 Configurações do board
Antes de partirmos para a configuração do nosso **burndowns.json**, devemos saber que o sistema funciona sobre algumas premissas referentes à configuração do board no Trello.
##### 2.2.1 Pontuação dos cards:
Se estamos falando de burndown, é óbvio que precisamos de pontos (sejam pontos de função, horas, ou o que quer que seja, passaremos a chamar de "pontos"). Portanto, devemos informar uma pontuação a cada card que for entrar no burndown gerado. Esse ponto deve ser informado no início do título do card, entre parênteses, podendo ser inteiro ou real (com ponto, e não com vírgula). Por exemplo, se o nome do card é "CRIAR ROTINA DE VALIDAÇÃO DE CNPJ" e vale 5.5 pontos, então seu nome deve ficar "(5.5) CRIAR ROTINA DE VALIDAÇÃO DE CNPJ".
##### 2.2.2 Label:
Também é exigido que todos os cards que entrarão no burndown desse board possuam um label para identificar que ele vai entrar. Esse label pode ser de qualquer cor, mas necessita ter um texto, o qual é sugerido que seja "BURN".
##### 2.2.3 Due date:
O fato do card possuir uma due date ou não determina se o mesmo já está pronto ou não. Caso ele possua uma due date, significa que já está finalizado, e terá seus pontos abaixados integralmente no dia informado na due date. Caso não tenha, o card é dado como não concluído, e caso não tenha nenhuma checklist com checks marcados (que será explicado posteriormente nesse documento), não terá nenhum ponto abaixado. **Obs.:** Sabemos que Due Date é originalmente usado como "Data prevista", mas a única maneira de obtermos a data de conclusão de maneira segura sem a versão premium é usar esse campo como se fosse "Data de término".
##### 2.2.4 Checklists:
Esse item é opcional. Foi criado devido à necessidade de que o burndowns caísse mais lentamente em tarefas grandes, durante o desenvolvimento do card, para que o scrum master conseguisse acompanhar mais de perto a queda do burndown. Funciona da seguinte forma: Caso o card **não** possua due date e tenha uma ou mais checklists, será abaixada a pontuação proporcional ao número de itens da checklist da **data atual**. Por exemplo: Se no dia 01/10/2015 existe um card sem due date de 12 pontos, mas com uma checklist de 4 itens com 3 deles marcados, então o burndown abaixará 9 pontos para o dia 01/10/2015. Vale lembrar que caso tenha se passado um dia, os pontos abaixados caminham junto, no caso, se fossemos para o dia 02/10/2015, os pontos abaixados seriam transferidos para 02/10/2015. Tambem é importante lembrarmos que **a partir do momento em que se informa uma due date, o comportamento da checklist é anulado, e volta a valer a regra do due date, explicado anteriormente**.

## 2.3 Configurações do burndowns.json
Finalmente chegamos nas configurações do arquivo dos burndowns, que guarda informações sobre cada burndown gerado pelo sistema. Sua estrutura é um arquivo JSON contendo um array de jsons Javascript. Para cada burndowns gerado, devemos ter um objeto json dentro desse array. Seus campos são:
##### 2.3.1 url_trello:
URL do board no Trello (string);
##### 2.3.2 data_inicial:
Primeiro dia do burndown (string, exemplo: "01/10/2015");
##### 2.3.3 data_final:
Último dia do burndown (string, exemplo: "10/10/2015");
##### 2.3.4 dias_sem_jornada:
Array Javascript conténdo strings informando os dias nos quais não haverá jornada de trabalho, e não deve ser mostrado no burndown. **Finais de semana não precisam ser informados, pois são removidos automaticamente**. Normalmente são os feriados. Caso não haja nenhum, deve ser informado um array vazio [];
##### 2.3.5 legenda_burndown:
Título mostrado dentro do burndown (pequeno). Pode ser utilizado, por exemplo, o nome do sistema do qual o burndown se trata;
##### 2.3.6 nome_label_burndown:
Nome do label que informa quais cards entrarão no burndown, que já foi configurado anteriormente, na seção Label das configurações do board;
##### 2.3.7 nome_da_equipe:
Originalmente era usado como nome da equipe, que ficava como título do burndown;
##### 2.3.8 width:
A largura dos burndowns varia de acordo com os dados informados em data_inicial e data_final. Por esse motivo se dá a existência desse campo, de maneira que seja possível configurar a largura. Nesse campo deve ser passada uma string informando a porcentagem de largura que o burndown ocupará na tela (por exemplo: "80%").

![alt tag](http://s9.postimg.org/iwie6844v/Sem_t_tulo.png)

![alt tag](http://s30.postimg.org/q1giiqlch/Sem_t_tulo.png)

![alt tag](http://s4.postimg.org/l05epzwdp/Sem_t_tulo.png)