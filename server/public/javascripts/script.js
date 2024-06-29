
    document.addEventListener("DOMContentLoaded", function(){
    document.querySelectorAll(".delete-btn").forEach(button => {
        button.addEventListener("click", async () =>{
        const noteId = button.getAttribute("data-id");
        const response = await fetch(`/notes/${noteId}`,
        {
           method: "DELETE",
        });
        if (response.ok) {
            button.closest("li").remove();
        }
        else{
            console.error("Failed to delete the note");
        }
    });
     
});

document.querySelectorAll(".edit-btn").forEach(button => {
    button.addEventListener("click", async () =>{
    const noteId = button.getAttribute("data-id");
    const newText = prompt("Enter the new text for the note");
    if(newText){
    const response = await fetch(`/notes/${noteId}`,
    {
       method: "PUT",
       headers: { "Content-type":"application/json"},
       body:JSON.stringify({text:newText})
    });
    
    if (response.ok) {
       console.log("success") 
       button.closest("li").querySelector("div").textContent = newText
       
    }
    else{
        console.error("Failed to edit the note");
    }
}
});
 
});
});
