const host = "localhost"
const groupsUrl = `http://${host}:8088/group`;
const accountsUrl = `http://${host}:8088/account`;

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

function financial(x, sign) {
    const result = x === null ? "" : (Number.parseFloat(x) * sign).toFixed(2);
    return result == "0.00" ? "" : result;
}
  
function addSection( group ){
    const div = document.createElement("div");
    div.classList.add( "top-level" );
    const label =document.createElement("h2");
    label.textContent = `${group.name} ${financial(group.amount, group.sign)}`;
    div.appendChild( label );
    addSectionColumn( div, group.groups[0] );
    addSectionColumn( div, group.groups[1] );
    document.body.appendChild( div );
}

function addSectionColumn( container, subgroup ){
    const div = document.createElement("div");
    div.classList.add( "debit-or-credit" );
    const label =document.createElement("h3");
    label.textContent = `${subgroup.name} ${financial(subgroup.amount, subgroup.sign)}`;
    div.appendChild( label );
    addGroupContents( div, subgroup.groups );
    container.appendChild( div );
}

function addGroupContents( container, groups, level=4 ){
    if (groups === undefined || groups.length < 1 ) return;
    for ( const group of groups){
        const div = document.createElement("div");
        div.classList.add( "group" );
        const label =document.createElement(`h${level}`);
        label.dataset.recordId = group.id;
        label.textContent = `${group.number}: ${group.name} ${financial(group.amount, group.sign)}`;
        div.appendChild( label );
        addGroupContents( div, group.groups, level+1 );
        addAccounts( div, group );
        container.appendChild( div );
    }
}

function addAccounts( container, group ){
    getAccounts( group ).then( accounts => {
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
    });
}
