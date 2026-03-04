
// STORAGE
function getData(key){ return JSON.parse(localStorage.getItem(key)) || []; }
function setData(key,data){ localStorage.setItem(key,JSON.stringify(data)); }

// NAVIGATION
function showSection(id){
    document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
    document.getElementById(id).classList.add('active');

    document.querySelectorAll('nav button').forEach(b=>b.classList.remove('active'));
    document.getElementById('nav-'+id)?.classList.add('active');

    if(id==='list') loadForms();
    if(id==='results') loadSelectors();
}

// ADD QUESTION
function addQuestion(){
    const container=document.getElementById('questionContainer');
    const div=document.createElement('div');
    div.className='question-box';
    div.innerHTML=`
        <span class="remove" onclick="this.parentElement.remove()">✖</span>
        <input type="text" class="q-text" placeholder="Question text">
        <select class="q-type" onchange="toggleOptions(this)">
            <option value="text">Text</option>
            <option value="rating">Rating (1-5)</option>
            <option value="choice">Multiple Choice</option>
            <option value="checkbox">Checkbox</option>
            <option value="dropdown">Dropdown</option>
            <option value="number">Number</option>
            <option value="date">Date</option>
            <option value="email">Email</option>
            <option value="file">File Upload</option>
            <option value="tel">Phone Number</option>
            <option value="url">Website URL</option>
        </select>
        <input type="text" class="q-options" placeholder="Comma separated options" style="display:none;">
    `;
    container.appendChild(div);
}

function toggleOptions(select){
    const options=select.parentElement.querySelector('.q-options');
    options.style.display = select.value==='choice' ? 'block':'none';
}

// SAVE FORM
function saveForm(){
    const title=document.getElementById('formTitle').value;
    if(!title) return alert("Enter title");

    const questions=[];
    document.querySelectorAll('.question-box').forEach(box=>{
        questions.push({
            text:box.querySelector('.q-text').value,
            type:box.querySelector('.q-type').value,
            options:box.querySelector('.q-options').value
        });
    });

    if(!questions.length) return alert("Add at least one question");

    const forms=getData('forms');
    forms.push({id:Date.now(),title,questions});
    setData('forms',forms);

    alert("Form Saved!");
    document.getElementById('formTitle').value='';
    document.getElementById('questionContainer').innerHTML='';
}

// // LOAD FORMS
// function loadForms(){
//     const forms=getData('forms');
//     const container=document.getElementById('formsList');
//     container.innerHTML='';

//     if(!forms.length){
//         container.innerHTML="<p>No forms yet</p>";
//         return;
//     }

//     forms.forEach(form=>{
//         container.innerHTML+=`
//         <div class="form-item">
//             <strong>${form.title}</strong>
//             <button class="btn btn-primary" onclick="window.location.href='/submit?id=${form.id}'">Fill</button>
//         </div>`;
//     });
// }

// // OPEN FORM
// function openForm(id){
//     const form=getData('forms').find(f=>f.id===id);
//     if(!form) return;

//     document.getElementById('submitTitle').innerText=form.title;
//     const container=document.getElementById('feedbackForm');
//     container.innerHTML='';

//     form.questions.forEach((q,i)=>{
//         let html=`<label><strong>${q.text}</strong></label>`;

//         if(q.type==='text'){
//             html+=`<textarea name="q${i}" required></textarea>`;
//         }
//         else if(q.type==='rating'){
//             for(let r=1;r<=5;r++){
//                 html+=`<label><input class='radio-btn' type="radio" name="q${i}" value="${r}" required> ${r}</label> `;
//             }
//         }
//         else{
//             q.options.split(',').forEach(opt=>{
//                 html+=`<label><input type="radio" name="q${i}" value="${opt.trim()}" required> ${opt.trim()}</label><br>`;
//             });
//         }

//         container.innerHTML+=html+"<br><br>";
//     });

//     container.innerHTML+=`<button type="button" class="btn btn-success" onclick="submitFeedback(${id})">Submit</button>`;

   
// }


function loadForms(){
    const forms=getData('forms');
    const container=document.getElementById('formsList');
    container.innerHTML='';
    if(!forms.length){
        container.innerHTML="<p>No forms yet</p>";
        return;
    }

    forms.forEach(form=>{
        container.innerHTML+=`
        <div class="form-item">
            <strong>${form.title}</strong>
            <div class='form-fill'>
                <button class="btn btn-primary" onclick="window.location.href='/submit?id=${form.id}'">Fill</button>
                <button class="btn btn-success" onclick="window.location.href='/create?id=${form.id}'">Edit</button>
                <button class="btn btn-danger" onclick="window.location.href='/submit?id=${form.id}'">Delete</button>
            </div>
        </div>`;
    });
}

function editForm(id){
    const form=getData('forms').find(f=>f.id===id);
    if(!form) return;
    editingFormId=id;
    document.getElementById('formTitle').value=form.title;
    document.getElementById('questionContainer').innerHTML='';
    form.questions.forEach(q=>addQuestion(q));
    showSection('create');
}

function deleteForm(id){
    let forms=getData('forms');
    forms=forms.filter(f=>f.id!==id);
    setData('forms',forms);
    loadForms();
}

function openForm(id){
    const form=getData('forms').find(f=>f.id===id);
    if(!form) return;

    document.getElementById('submitTitle').innerText=form.title;
    const container=document.getElementById('feedbackForm');
    container.innerHTML='';

    form.questions.forEach((q,i)=>{
        let html=`<label><strong>${q.text}</strong></label><br>`;

        if(q.type==='rating'){
            for(let r=1;r<=5;r++){
                html+=`<label><input type="radio" name="q${i}" value="${r}" required> ${r}</label> `;
            }
        }
        else if(['mcq','dropdown'].includes(q.type)){
            q.options.split(',').forEach(opt=>{
                html+=`<label><input type="radio" name="q${i}" value="${opt.trim()}" required> ${opt.trim()}</label><br>`;
            });
        }
        else if(q.type==='checkbox'){
            q.options.split(',').forEach(opt=>{
                html+=`<label><input type="checkbox" name="q${i}" value="${opt.trim()}"> ${opt.trim()}</label><br>`;
            });
        }
        else{
            html+=`<input type="${q.type}" name="q${i}" required>`;
        }

        container.innerHTML+=html+"<br><br>";
    });

    container.innerHTML+=`<button type="button" class="btn btn-success" onclick="submitFeedback(${id})">Submit</button>`;
    showSection('submit');
}




// // SUBMIT
// function submitFeedback(id){
//     const form=getData('forms').find(f=>f.id===id);
//     const formEl=document.getElementById('feedbackForm');
//     const data=new FormData(formEl);

//     const responses=getData('responses');

//     const response={
//         formId:id,
//         anonymous:document.getElementById('anonymous').checked,
//         answers:[]
//     };

//     form.questions.forEach((q,i)=>{
//         response.answers.push({
//             question:q.text,
//             type:q.type,
//             answer:data.get('q'+i)
//         });
//     });

//     responses.push(response);
//     setData('responses',responses);

//     alert("Feedback Submitted!");
//     showSection('list');
// }


function submitFeedback(id){
    const form=getData('forms').find(f=>f.id===id);
    const data=new FormData(document.getElementById('feedbackForm'));
    const responses=getData('responses');

    const response={
        formId:id,
        anonymous:document.getElementById('anonymous').checked,
        answers:[]
    };

    form.questions.forEach((q,i)=>{
        response.answers.push({
            question:q.text,
            type:q.type,
            answer:data.getAll('q'+i).join(', ')
        });
    });

    responses.push(response);
    setData('responses',responses);

    alert("Feedback Submitted!");
    showSection('list');
}

// RESULTS
function loadSelectors(){
    const forms=getData('forms');
    const select=document.getElementById('resultSelector');
    select.innerHTML="<option>Select Form</option>";
    forms.forEach(f=>{
        select.innerHTML+=`<option value="${f.id}">${f.title}</option>`;
    });
}

function renderResults(){
    const id=parseInt(document.getElementById('resultSelector').value);
    const container=document.getElementById('resultContent');
    container.innerHTML='';

    const form=getData('forms').find(f=>f.id===id);
    const responses=getData('responses').filter(r=>r.formId===id);

    if(!responses.length){
        container.innerHTML="<p>No responses yet.</p>";
        return;
    }

    form.questions.forEach((q,i)=>{
        let content=`<strong>${q.text}</strong><br><br>`;

        if(q.type==='rating'){
            let total=0;
            responses.forEach(r=> total+=parseInt(r.answers[i].answer||0));
            const avg=(total/responses.length).toFixed(2);
            content+=`<div class="highlight">${avg}/5</div>`;
        }else{
            content+=`Total Responses: ${responses.length}`;
        }

        container.innerHTML+=`<div class="stat-card">${content}</div>`;
    });
}

window.onload=loadForms;