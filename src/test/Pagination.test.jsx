import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Pagination from '../components/pagination/Pagination';

const renderPagination = (props) =>
    render(
        <MemoryRouter>
            <Pagination {...props} />
        </MemoryRouter>
    );

const defaultProps = { totalPages: 5, currentPage: 1, paginate: () => {} };

describe('Pagination', () => {
    it('renders nothing when totalPages is 1', () => {
        const { container } = renderPagination({ ...defaultProps, totalPages: 1 });
        expect(container.firstChild).toBeNull();
    });

    it('renders correct number of page buttons', () => {
        renderPagination(defaultProps);
        // 5 pages + 2 arrow buttons = 7
        const buttons = screen.getAllByRole('button');
        expect(buttons).toHaveLength(7);
    });

    it('marks current page button as active', () => {
        renderPagination({ ...defaultProps, currentPage: 3 });
        const page3 = screen.getByLabelText('Page 3');
        expect(page3).toHaveClass('active');
    });

    it('does not mark non-current page as active', () => {
        renderPagination({ ...defaultProps, currentPage: 2 });
        const page1 = screen.getByLabelText('Page 1');
        expect(page1).not.toHaveClass('active');
    });

    it('calls paginate with correct page on click', () => {
        const paginate = vi.fn();
        renderPagination({ ...defaultProps, paginate });
        fireEvent.click(screen.getByLabelText('Page 3'));
        expect(paginate).toHaveBeenCalledWith(3);
    });

    it('disables Previous button on first page', () => {
        renderPagination({ ...defaultProps, currentPage: 1 });
        expect(screen.getByLabelText('Previous page')).toBeDisabled();
    });

    it('disables Next button on last page', () => {
        renderPagination({ ...defaultProps, currentPage: 5 });
        expect(screen.getByLabelText('Next page')).toBeDisabled();
    });

    it('Previous button calls paginate with currentPage - 1', () => {
        const paginate = vi.fn();
        renderPagination({ ...defaultProps, currentPage: 3, paginate });
        fireEvent.click(screen.getByLabelText('Previous page'));
        expect(paginate).toHaveBeenCalledWith(2);
    });

    it('Next button calls paginate with currentPage + 1', () => {
        const paginate = vi.fn();
        renderPagination({ ...defaultProps, currentPage: 3, paginate });
        fireEvent.click(screen.getByLabelText('Next page'));
        expect(paginate).toHaveBeenCalledWith(4);
    });

    it('has aria-current="page" on active button', () => {
        renderPagination({ ...defaultProps, currentPage: 2 });
        const active = screen.getByLabelText('Page 2');
        expect(active).toHaveAttribute('aria-current', 'page');
    });

    it('renders nothing when totalPages is 0', () => {
        const { container } = renderPagination({ ...defaultProps, totalPages: 0 });
        expect(container.firstChild).toBeNull();
    });
});
