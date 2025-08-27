import Pagination from "rc-pagination"
import "rc-pagination/assets/index.css"
import { paginationStore, type PaginationStoreType } from "../store/projectStore"
export const PaginationComp =()=>{
    const {currentPage, pageSize, total, setCurrentPage}:PaginationStoreType = paginationStore(state=>state)
    return(
        <div className="pagination-div">
          <Pagination
            current={currentPage}           // current active page
            pageSize={pageSize}             // items per page
            total={total}              // total items
            onChange={(page) => setCurrentPage(page)} // runs when user clicks page
      />
    </div>
    )
}