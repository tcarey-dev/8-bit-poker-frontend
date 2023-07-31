import "nes.css/css/nes.min.css";

function Errors({ errors }) {

    const getErrorList = (err) => {
      if (Array.isArray(err)) {
        return err;
      } else {
        return [err];
      }
    }
  
    return <>
      {getErrorList(errors).length > 0 && <div className="alert alert-danger">
        <ul className="nes-list is-circle">
          {getErrorList(errors).map(err => <li key={err}>{err}</li>)}
        </ul>
      </div>}
    </>
}
  
  export default Errors;