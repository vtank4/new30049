// Smoothly scrolls to the specified page section when called
// `pageRef` is a reference to the target DOM element
export const handleScroll = (pageRef) => {
    pageRef.current.scrollIntoView({behavior: 'smooth'});
}

// Updates form data based on user input
// `e` is the event object from the input field change event
// `setFormData` is a function to update the form data state
export const handleInput = (e, setFormData) => {
    const { id, value } = e.target; // Destructure `id` and `value` from the input element
    setFormData((prevData) => ({
      ...prevData,   // Preserve previous form data
      [id]: value,// Update the specific field based on the input's `id` attribute
    }));
  };