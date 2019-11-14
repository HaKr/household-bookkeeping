//const host = "localhost"
const groupsUrl = `/data/group`;
const accountsUrl = `/data/account`;

const xhr = new XMLHttpRequest();

window.addEventListener( "load", startApp );

function startApp(){
    xhr.addEventListener( "load", addGroups );
    xhr.open( "GET", groupsUrl );
    xhr.send();    
}

function getAccounts( group ){
    const url = `${groupsUrl}/${group.id}`
    const accountsRes = new XMLHttpRequest();

    return new Promise( resolve => {
        accountsRes.addEventListener( "load", event => {
            const accounts = JSON.parse( event.target.responseText ).accounts;
            resolve( accounts );
        });

        accountsRes.open( "GET", url );
        accountsRes.send();
    } );

}

function getAccountBalance( account ){
    const url = `${accountsUrl}/${account.id}`
    const accountsRes = new XMLHttpRequest();

    return new Promise( resolve => {
        accountsRes.addEventListener( "load", event => {
            resolve( JSON.parse( event.target.responseText ).amount );
        });

        accountsRes.open( "GET", url );
        accountsRes.send();
    } );

}

function addGroups(){
    const groupTree = JSON.parse( xhr.responseText );
    addSection( groupTree[0] );
    addSection( groupTree[1] );
}

const formatter = Intl.NumberFormat( "nl-NL", {  minimumFractionDigits: 2} );

function financial(x, sign) {
    const result = x === null ? "" : formatter.format(Number.parseFloat(x) * sign);
    return result == "0,00" | result == "-0,00" ? "" : result;
}
  
function addSection( group ){
    const div = document.createElement("div");
    div.classList.add( "top-level" );
    const label =document.createElement("h2");
    label.textContent = `${group.name} ${financial(group.amount, group.sign)}`;
    div.appendChild( label );
    document.body.appendChild( div );
    addSectionColumn( div, group.groups[0] );
    addSectionColumn( div, group.groups[1] );
    // document.body.appendChild( div );
}

async function addSectionColumn( container, subgroup ){
    const div = document.createElement("div");
    div.classList.add( "debit-or-credit" );
    const label =document.createElement("h3");
    label.innerHTML = `<span class=account-number></span>${subgroup.name}<span class=account-balance>${financial(subgroup.amount, subgroup.sign)}</span>`;
    div.appendChild( label );
    container.appendChild( div );
    await addGroupContents( div, subgroup.groups );
    await addAccounts( div, subgroup );
}

async function addGroupContents( container, groups, level=4 ){
    if (groups === undefined || groups.length < 1 ) return;

    for ( const group of groups){
        const div = document.createElement("div");
        div.classList.add( "group", `g${group.number}` );
        div.dataset.recordId = group.id;
        container.appendChild( div );
        const label =document.createElement(`h${level}`);
        label.dataset.recordId = group.id;
        label.innerHTML = `<span class=account-number>${group.number}</span>${group.name} <span class=account-balance>${financial(group.amount, group.sign)}</span>`;
        await addAccounts( div, group );
        await addGroupContents( div, group.groups, level );
        div.appendChild( label );
    }
}

async function addAccounts( container, group ){
    const accounts = await  getAccounts( group );
    if (accounts.length > 0 ){
        const table = document.createElement("table");
        table.dataset.recordId = group.id;
        for (const account of accounts){
            const tr = table.insertRow();
            tr.dataset.recordId = account.id;
            const nrCell = tr.insertCell();
            nrCell.classList.add("account-number");
            nrCell.textContent = account.number;
            const nameCell = tr.insertCell();
            nameCell.classList.add("account-name");
            nameCell.textContent = account.name;
            const balanceCell = tr.insertCell();
            balanceCell.classList.add("account-balance");
            getAccountBalance( account ).then( amount => {
                balanceCell.textContent = financial( amount, group.sign );
            })
            
        }
        container.appendChild( table );
    }
}
